# SQL Grimoire

SQL Grimoire frames database-reasoning exercises as narrative investigations in a persistent learning world.

## Language

**Mission**:
A narrative database incident with its own data, objective, grading rules, guidance, reward, and explanation.
_Avoid_: Challenge, exercise, level

**Location**:
A place in the narrative world that appears on the campaign map and may offer zero or more Missions. A locked Location can exist before its Missions do.
_Avoid_: Map spot, mission marker

**Mission Attempt**:
A player's transient investigation of one Mission, including their current query, results, hints, and verdict. Only the current Mission and last query are durable across refreshes.
_Avoid_: Session, run, workbench state

**Player Progress**:
The durable record of a player's current Mission, earned XP, completed Missions, last queries, and Grimoire entries. It is the authority for applying a Mission completion exactly once.
_Avoid_: Save state, profile

**Grimoire Entry**:
The durable learning record produced by a completed Mission, containing the player's query, the reference query, concepts, and explanation.
_Avoid_: Journal entry, completion record
