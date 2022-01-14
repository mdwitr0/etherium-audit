export const QUEUE_NAMES = {
  BLOCK: 'queue:block',
};

export const JOB_NAMES = {
  BLOCK_UPDATE: `${QUEUE_NAMES.BLOCK}:update`,
};

export const JOB_OPTIONS = {
  REMOVE_ON_COMPLETE_LATEST_BLOCK: 2,
  EVERY_LATEST_BLOCK: 60 * 60 * 1,
};
