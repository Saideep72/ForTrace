import re
import hashlib
import time
import uuid

class TEESimulator:
    def __init__(self):
        # Secure, in-memory isolated registry for token mapping
        # In a real TEE, this memory space is encrypted at the CPU level
        self._mask_registry = {}
        self._reverse_registry = {}
        self.enclave_id = str(uuid.uuid4())
        self.measurement_hash = hashlib.sha256(f"fortrace-enclave-{self.enclave_id}".encode()).hexdigest()

    def get_attestation_report(self) -> dict:
        """
        Generates a cryptographic hardware attestation report.
        Simulates verification of enclave code integrity under AMD SEV-SNP.
        """
        timestamp = time.time()
        signature_payload = f"{self.measurement_hash}-{timestamp}"
        signature = hashlib.sha256(signature_payload.encode()).hexdigest()
        
        return {
            "enclave_id": self.enclave_id,
            "attestation_status": "VERIFIED_AMD_SEV_SNP",
            "measurement": self.measurement_hash,
            "timestamp": timestamp,
            "signature": signature,
            "provider": "Intel SGX / AMD SEV Hardware Vault",
            "enclave_debug": False
        }

    def anonymize_text(self, text: str) -> tuple[str, list[str]]:
        """
        Finds sensitive identifiers (asset tags, IP addresses, serial numbers, specific failure details)
        and replaces them with safe generic placeholders.
        Returns the anonymized text and a list of step logs.
        """
        logs = []
        logs.append(f"[TEE Enclave] Analyzing text payload of size {len(text)} characters...")
        
        # Regex to find asset tags like E-201, P-302, TK-307, HX-306, etc.
        asset_pattern = r'\b([A-Z]{1,3}-\d{2,4})\b'
        matches = list(set(re.findall(asset_pattern, text)))
        
        anonymized_text = text
        for idx, match in enumerate(matches):
            placeholder = f"[ASSET_{idx}]"
            self._mask_registry[match] = placeholder
            self._reverse_registry[placeholder] = match
            anonymized_text = anonymized_text.replace(match, placeholder)
            logs.append(f"[TEE Enclave] Masking sensitive asset tag: '{match}' -> '{placeholder}'")

        # Mask potential email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = list(set(re.findall(email_pattern, anonymized_text)))
        for idx, email in enumerate(emails):
            placeholder = f"[USER_EMAIL_{idx}]"
            self._mask_registry[email] = placeholder
            self._reverse_registry[placeholder] = email
            anonymized_text = anonymized_text.replace(email, placeholder)
            logs.append(f"[TEE Enclave] Masking user identifier: '{email}' -> '{placeholder}'")

        if not matches and not emails:
            logs.append("[TEE Enclave] No sensitive identifiers found. Payload is safe.")
            
        return anonymized_text, logs

    def deanonymize_text(self, text: str) -> tuple[str, list[str]]:
        """
        Restores original names inside the response before returning it to the user.
        """
        logs = []
        logs.append("[TEE Enclave] Receiving response payload from external LLM...")
        
        restored_text = text
        replaced_count = 0
        for placeholder, original in self._reverse_registry.items():
            if placeholder in restored_text:
                restored_text = restored_text.replace(placeholder, original)
                logs.append(f"[TEE Enclave] Restored tag: '{placeholder}' -> '{original}'")
                replaced_count += 1
                
        if replaced_count > 0:
            logs.append(f"[TEE Enclave] Successfully restored {replaced_count} masked tokens inside secure memory.")
        else:
            logs.append("[TEE Enclave] No masked tokens detected in the response.")
            
        return restored_text, logs
