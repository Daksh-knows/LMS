/**
 * Content drip scheduling helpers.
 *
 * A lecture can be gated in two ways:
 *   1. Time gate    — an absolute `releaseAt` on the lecture and/or its module.
 *                     The effective release time is the LATER of the two.
 *   2. Prereq gate  — the lecture requires other lectures in the same course
 *                     to be completed first.
 *
 * Content with no `releaseAt` and no prerequisites is never locked, so existing
 * courses behave exactly as before (the feature is opt-in).
 */

export interface LockInput {
  /** The gated lecture's own release date (nullable). */
  lectureReleaseAt?: Date | string | null;
  /** The parent module's release date (nullable). */
  moduleReleaseAt?: Date | string | null;
  /** IDs of prerequisite lectures that must be completed first. */
  prerequisiteIds?: string[];
  /** IDs of lectures the current user has completed (in this course). */
  completedLectureIds?: string[];
  /** Evaluation time. Defaults to now. */
  now?: Date;
}

export interface LockState {
  isLocked: boolean;
  lockedByTime: boolean;
  lockedByPrereq: boolean;
  /** Effective release time (ISO string) or null when there is no time gate. */
  releaseAt: string | null;
  /** Prerequisite IDs the user has NOT yet completed. */
  unmetPrerequisiteIds: string[];
}

const toDate = (v?: Date | string | null): Date | null => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * The effective release time = the LATER of the lecture and module release
 * dates. Returns null when neither is set.
 */
export function getEffectiveReleaseAt(
  lectureReleaseAt?: Date | string | null,
  moduleReleaseAt?: Date | string | null
): Date | null {
  const l = toDate(lectureReleaseAt);
  const m = toDate(moduleReleaseAt);
  if (l && m) return l > m ? l : m;
  return l ?? m ?? null;
}

export function computeLockState({
  lectureReleaseAt,
  moduleReleaseAt,
  prerequisiteIds = [],
  completedLectureIds = [],
  now = new Date(),
}: LockInput): LockState {
  const effective = getEffectiveReleaseAt(lectureReleaseAt, moduleReleaseAt);
  const lockedByTime = !!effective && effective.getTime() > now.getTime();

  const completed = new Set(completedLectureIds);
  const unmetPrerequisiteIds = prerequisiteIds.filter((id) => !completed.has(id));
  const lockedByPrereq = unmetPrerequisiteIds.length > 0;

  return {
    isLocked: lockedByTime || lockedByPrereq,
    lockedByTime,
    lockedByPrereq,
    releaseAt: effective ? effective.toISOString() : null,
    unmetPrerequisiteIds,
  };
}
