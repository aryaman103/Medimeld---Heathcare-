#!/usr/bin/env python3
"""
Test script to push local records to the sync endpoint
"""

import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
from typing import List
from schemas import NoteData, WoundType, WoundSeverity
import random

# Sample data for testing
SAMPLE_NOTES = [
    {
        "photo_hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
        "wound_type": WoundType.LACERATION,
        "wound_severity": WoundSeverity.MODERATE,
        "soap_note": """Subjective: Patient presents with 3cm laceration on left forearm sustained 2 hours ago while working with sharp tools.

Objective: 
- 3cm linear laceration on volar surface of left forearm
- Clean wound edges, no foreign bodies visible
- Minimal bleeding, no active hemorrhage
- Surrounding skin intact, no signs of infection
- Distal neurovascular function intact

Assessment: Clean laceration, moderate severity, requiring closure

Plan: 
- Clean wound with sterile saline
- Apply topical antibiotic ointment
- Close with 4-0 nylon sutures
- Apply sterile dressing
- Tetanus prophylaxis if needed
- Follow up in 7 days for suture removal""",
        "timestamp": datetime.utcnow() - timedelta(hours=2)
    },
    {
        "photo_hash": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1",
        "wound_type": WoundType.BURN,
        "wound_severity": WoundSeverity.SEVERE,
        "soap_note": """Subjective: Patient presents with 2nd degree burn on right hand sustained 6 hours ago from hot oil splash.

Objective:
- 5cm x 3cm partial thickness burn on dorsum of right hand
- Blistering present, some blisters ruptured
- Surrounding erythema and edema
- Pain rated 7/10
- Range of motion limited due to pain and swelling

Assessment: 2nd degree burn, severe, requiring specialized care

Plan:
- Clean wound with sterile saline
- Apply silver sulfadiazine cream
- Apply non-adherent dressing
- Elevate hand to reduce swelling
- Prescribe oral analgesics
- Refer to burn specialist for follow-up
- Monitor for signs of infection""",
        "timestamp": datetime.utcnow() - timedelta(hours=6)
    },
    {
        "photo_hash": "c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2",
        "wound_type": WoundType.ULCER,
        "wound_severity": WoundSeverity.CRITICAL,
        "soap_note": """Subjective: Patient presents with chronic diabetic foot ulcer on left great toe, worsening over past 2 weeks.

Objective:
- 2cm x 1.5cm deep ulcer on plantar surface of left great toe
- Necrotic tissue present, foul odor
- Surrounding erythema and induration
- Pedal pulses diminished
- Sensation decreased in affected area
- Temperature elevated in surrounding tissue

Assessment: Chronic diabetic foot ulcer with signs of infection, critical severity

Plan:
- Debride necrotic tissue
- Obtain wound culture
- Start broad-spectrum antibiotics
- Apply wet-to-dry dressings
- Refer to vascular surgery
- Optimize diabetes management
- Consider hyperbaric oxygen therapy
- Daily wound care and monitoring""",
        "timestamp": datetime.utcnow() - timedelta(days=1)
    }
]

async def push_notes_to_server(notes: List[NoteData], server_url: str = "http://localhost:8000"):
    """Push notes to the sync endpoint"""
    
    async with aiohttp.ClientSession() as session:
        try:
            # Convert notes to dict format for JSON serialization
            notes_data = [note.dict() for note in notes]
            
            async with session.post(
                f"{server_url}/sync",
                json=notes_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ Sync successful!")
                    print(f"   Synced: {result['synced_count']} notes")
                    print(f"   Failed: {result['failed_count']} notes")
                    
                    if result['failed_notes']:
                        print("   Failed notes:")
                        for failed in result['failed_notes']:
                            print(f"     - {failed['photo_hash']}: {failed['error']}")
                    
                    return result
                else:
                    error_text = await response.text()
                    print(f"❌ Sync failed with status {response.status}: {error_text}")
                    return None
                    
        except aiohttp.ClientError as e:
            print(f"❌ Network error: {e}")
            return None
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return None

async def test_server_health(server_url: str = "http://localhost:8000"):
    """Test if the server is running"""
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{server_url}/") as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ Server is healthy: {result}")
                    return True
                else:
                    print(f"❌ Server health check failed: {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Cannot connect to server: {e}")
            return False

def generate_sample_notes(count: int = 3) -> List[NoteData]:
    """Generate sample notes for testing"""
    
    wound_types = list(WoundType)
    severities = list(WoundSeverity)
    
    notes = []
    for i in range(count):
        # Generate a random hash
        hash_chars = "abcdefghijklmnopqrstuvwxyz0123456789"
        photo_hash = ''.join(random.choice(hash_chars) for _ in range(64))
        
        wound_type = random.choice(wound_types)
        severity = random.choice(severities)
        
        # Generate timestamp within last 24 hours
        hours_ago = random.randint(1, 24)
        timestamp = datetime.utcnow() - timedelta(hours=hours_ago)
        
        # Generate simple SOAP note
        soap_note = f"""Subjective: Patient presents with {wound_type.value} wound.
Objective: {severity.value} severity wound observed.
Assessment: {wound_type.value} wound, {severity.value} severity.
Plan: Standard wound care protocol."""
        
        note = NoteData(
            photo_hash=photo_hash,
            wound_type=wound_type,
            wound_severity=severity,
            soap_note=soap_note,
            timestamp=timestamp
        )
        notes.append(note)
    
    return notes

async def main():
    """Main test function"""
    
    print("🏥 MediMeld Edge Sync Test")
    print("=" * 40)
    
    # Test server health
    print("\n1. Testing server health...")
    if not await test_server_health():
        print("❌ Server is not running. Please start the server first:")
        print("   cd backend && python main.py")
        return
    
    # Use predefined sample notes or generate random ones
    use_predefined = input("\nUse predefined sample notes? (y/n, default: y): ").lower() != 'n'
    
    if use_predefined:
        notes = [NoteData(**note) for note in SAMPLE_NOTES]
        print(f"📝 Using {len(notes)} predefined sample notes")
    else:
        count = int(input("How many random notes to generate? (default: 3): ") or "3")
        notes = generate_sample_notes(count)
        print(f"📝 Generated {len(notes)} random notes")
    
    # Show notes to be synced
    print("\n2. Notes to be synced:")
    for i, note in enumerate(notes, 1):
        print(f"   {i}. {note.wound_type.value} ({note.wound_severity.value}) - {note.photo_hash[:16]}...")
    
    # Push to server
    print("\n3. Pushing to server...")
    result = await push_notes_to_server(notes)
    
    if result:
        print("\n✅ Test completed successfully!")
    else:
        print("\n❌ Test failed!")

if __name__ == "__main__":
    asyncio.run(main()) 