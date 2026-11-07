# Timestamps

`manifest_2026-11-06.txt` lists the public release commit and every registration fingerprint (`planned/*PREREG*.sha256`) as published. `manifest_2026-11-06.txt.ots` is an [OpenTimestamps](https://opentimestamps.org) proof of that file, submitted to three public calendars on 6 Nov 2026.

What it proves: these fingerprints existed no later than the Bitcoin block the proof points to. What it does not prove: when each study was registered before that. The public repository has no history before 6 Nov 2026, so for earlier studies the order "registered, then run" rests on the author's private history and is not checkable here.

From now on each new registration is stamped when it is written, before its runs, so for those studies the order is checkable.

Check: `pip install opentimestamps-client`, then `ots verify timestamps/manifest_2026-11-06.txt.ots` (needs a Bitcoin node or the calendar servers), or drop both files on opentimestamps.org. The proof is complete: it is anchored in Bitcoin block 974,877 (mined 7 Nov 2026, 01:59 UTC; Merkle root dee625f4…faef5814), so the fingerprints existed no later than that. Two other calendars' branches are still marked pending; one confirmed branch is enough.
