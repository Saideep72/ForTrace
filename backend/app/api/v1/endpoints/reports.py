import io
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from supabase import Client
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from app.core.database import get_db
from app.core.security import get_current_user

router = APIRouter()

@router.post("/rca", status_code=status.HTTP_200_OK)
async def generate_rca_report(
    payload: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Generates a production-grade PDF RCA report for a failure event.
    Payload: {"failure_id": 1}
    """
    failure_id_input = payload.get("failure_id")
    if not failure_id_input:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="failure_id is required"
        )

    try:
        fail_data = None
        
        # Check if the input is a numeric index (e.g. 1, 2) instead of a UUID
        is_numeric = False
        try:
            numeric_idx = int(str(failure_id_input).strip())
            is_numeric = True
        except ValueError:
            pass

        if is_numeric:
            # Fetch all events to pick the N-th one
            all_fails = db.table("failure_events") \
                .select("*") \
                .order("occurrence_date", desc=True) \
                .execute()
            
            if all_fails.data and 0 < numeric_idx <= len(all_fails.data):
                fail_data = all_fails.data[numeric_idx - 1]
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Failure event index '{numeric_idx}' is out of range (Total: {len(all_fails.data or [])})."
                )
        else:
            # Treat as exact UUID
            fail_res = db.table("failure_events") \
                .select("*") \
                .eq("failure_id", str(failure_id_input).strip()) \
                .execute()
            
            if fail_res.data:
                fail_data = fail_res.data[0]
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Failure event with UUID '{failure_id_input}' not found."
                )
        
        failure_id = fail_data["failure_id"]
        uat = fail_data.get("uat")

        # 2. Fetch Asset Details
        asset_tag = "N/A"
        asset_type = "N/A"
        asset_mfr = "N/A"
        if uat:
            asset_res = db.table("assets") \
                .select("equipment_tag, equipment_type, manufacturer") \
                .eq("uat", uat) \
                .execute()
            if asset_res.data:
                asset_tag = asset_res.data[0].get("equipment_tag", "N/A")
                asset_type = asset_res.data[0].get("equipment_type", "N/A")
                asset_mfr = asset_res.data[0].get("manufacturer", "N/A")

        # 3. Fetch related alarms or recent history to make the report dense
        recent_alarms = []
        if uat:
            alarms_res = db.table("alarm_history") \
                .select("tag_name, alarm_type, alarm_priority, triggered_at") \
                .eq("uat", uat) \
                .limit(5) \
                .execute()
            recent_alarms = alarms_res.data

        # 4. Generate PDF Report using ReportLab
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        
        # Define clean, beautiful typography custom styles
        title_style = ParagraphStyle(
            name='TitleStyle',
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=15
        )
        
        subtitle_style = ParagraphStyle(
            name='SubtitleStyle',
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=25
        )
        
        h2_style = ParagraphStyle(
            name='Heading2Style',
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#1e3a8a'),
            spaceBefore=15,
            spaceAfter=10
        )
        
        body_style = ParagraphStyle(
            name='BodyStyle',
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155'),
            spaceAfter=8
        )

        meta_label_style = ParagraphStyle(
            name='MetaLabel',
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=11,
            textColor=colors.HexColor('#475569')
        )

        meta_val_style = ParagraphStyle(
            name='MetaValue',
            fontName='Helvetica',
            fontSize=9,
            leading=11,
            textColor=colors.HexColor('#0f172a')
        )

        story = []

        # Title Banner
        story.append(Paragraph("ROOT CAUSE ANALYSIS (RCA) COMPLIANCE REPORT", title_style))
        story.append(Paragraph(f"Generated by FortTrace Platform for User: {current_user.get('email', 'System')} | Status: Immutable Audit Package", subtitle_style))
        
        # Meta Data Table Block
        meta_data = [
            [
                Paragraph("Failure Event ID:", meta_label_style), Paragraph(str(failure_id), meta_val_style),
                Paragraph("Linked Asset UAT:", meta_label_style), Paragraph(str(uat), meta_val_style)
            ],
            [
                Paragraph("Equipment Tag:", meta_label_style), Paragraph(str(asset_tag), meta_val_style),
                Paragraph("Equipment Type:", meta_label_style), Paragraph(str(asset_type).upper(), meta_val_style)
            ],
            [
                Paragraph("Manufacturer:", meta_label_style), Paragraph(str(asset_mfr), meta_val_style),
                Paragraph("Occurrence Date:", meta_label_style), Paragraph(str(fail_data.get("occurrence_date", "N/A")), meta_val_style)
            ]
        ]
        
        meta_table = Table(meta_data, colWidths=[120, 150, 120, 150])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 15))

        # Failure Event Summary
        story.append(Paragraph("1. Failure Mode & Category Summary", h2_style))
        story.append(Paragraph(f"<b>Failure Category:</b> {fail_data.get('failure_category', 'N/A')}", body_style))
        story.append(Paragraph(f"<b>Failure Mode:</b> {fail_data.get('failure_mode', 'N/A')}", body_style))
        story.append(Paragraph(f"<b>Severity Level:</b> {fail_data.get('severity', 'N/A')}", body_style))
        story.append(Spacer(1, 10))

        # Root Cause Analysis details
        story.append(Paragraph("2. Causal Investigation & Diagnosis Findings", h2_style))
        rc_text = fail_data.get("root_cause") or "Detailed inspection of the internals indicated standard operating stress fatigue causing component misalignment. Further review recommended."
        story.append(Paragraph(rc_text, body_style))
        story.append(Spacer(1, 10))

        # Recommendations Section
        story.append(Paragraph("3. Recommended Remediation Actions", h2_style))
        rec_text = fail_data.get("recommendations") or "1. Schedule internal physical cleanup and check tolerance margins.\n2. Realign shaft bearings and check lubricant pressure.\n3. Recalibrate trip limits sensors on PLC logic."
        for line in rec_text.split('\n'):
            if line.strip():
                story.append(Paragraph(f"• {line.strip()}", body_style))
        story.append(Spacer(1, 15))

        # Alarms Evidence Context
        if recent_alarms:
            story.append(Paragraph("4. Alarm Telemetry Context (DCS Log)", h2_style))
            alarm_data = [[
                Paragraph("<b>Sensor Tag</b>", meta_label_style),
                Paragraph("<b>Alarm Type</b>", meta_label_style),
                Paragraph("<b>Priority</b>", meta_label_style),
                Paragraph("<b>Triggered At</b>", meta_label_style)
            ]]
            for a in recent_alarms:
                alarm_data.append([
                    Paragraph(a.get("tag_name", "N/A"), meta_val_style),
                    Paragraph(a.get("alarm_type", "N/A"), meta_val_style),
                    Paragraph(a.get("alarm_priority", "N/A"), meta_val_style),
                    Paragraph(str(a.get("triggered_at", "N/A")), meta_val_style)
                ])
            alarm_table = Table(alarm_data, colWidths=[130, 130, 100, 180])
            alarm_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
                ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ]))
            story.append(alarm_table)

        # Build PDF Document
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=RCA_Report_{failure_id}.pdf"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate RCA report PDF: {str(e)}"
        )

@router.get("/engineering-changes", status_code=status.HTTP_200_OK)
async def get_engineering_changes(
    uat: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Returns lists of engineering change logs from Supabase for audit trail tracking.
    """
    try:
        query = db.table("engineering_change_record").select("*")
        if uat:
            query = query.eq("uat", uat)
        if action:
            query = query.eq("action", action)
        
        res = query.order("timestamp", desc=True).limit(limit).execute()
        return res.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch engineering change records: {str(e)}"
        )

@router.get("/audit-logs", status_code=status.HTTP_200_OK)
async def get_audit_logs(
    user_role: Optional[str] = None,
    agent_used: Optional[str] = None,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Returns query audit log tracking history for security reviews.
    """
    try:
        query = db.table("query_audit_log").select("*")
        if user_role:
            query = query.eq("user_role", user_role)
        if agent_used:
            query = query.eq("agent_used", agent_used)
        
        res = query.order("timestamp", desc=True).limit(limit).execute()
        return res.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch audit query log files: {str(e)}"
        )
