# Explicit Gender Classification and Advisory Matching

## Purpose

This module reads only explicit audience wording in a job advertisement. It does not infer eligibility from occupation names, writing style, company type, location, or stereotypes.

## Classification values

- `MALE`: the advertisement explicitly says men/males only.
- `FEMALE`: the advertisement explicitly says women/females only.
- `BOTH`: the advertisement explicitly says both genders or contains explicit evidence for each.
- `UNSPECIFIED`: no explicit audience statement was found.

`UNSPECIFIED` is stored as `null` in Prisma. It is never converted to `BOTH`.

## Matching behavior

- A compatible explicit statement returns `MATCH`.
- A mismatch returns `MISMATCH_REVIEW` and requires user acknowledgement in the UI.
- The user can still proceed. The engine never submits, rejects, hides, ranks, or deletes a job automatically based on gender.
- Missing user gender returns `USER_GENDER_UNKNOWN` without a warning.
- Missing advertisement evidence returns `NOT_APPLICABLE`, not a fabricated match.

## Prohibited inference examples

The following titles alone do not determine target gender:

- `محاسبة`
- `مهندس موقع`
- `حارس أمن`
- `معلمة`

Only explicit phrases such as `مخصصة للنساء فقط`, `للرجال فقط`, or `متاحة للجنسين` are classified.
