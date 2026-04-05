/**
 * Shared vertical sizing for primary “search / task” fields so Chat, Task, and compact
 * controls stay aligned (matches Tailwind `h-9` / 36px).
 */
export const PRIMARY_INPUT_MIN_HEIGHT_PX = 36;

/**
 * Expanded shell minimum for the main TaskInput. This includes the button rail's
 * vertical padding, so the input chrome doesn't clip the Learn/Race controls.
 */
export const TASK_INPUT_SHELL_MIN_HEIGHT_PX = 46;

/** TaskInput (RL) max auto-grow — large pastes only */
export const TASK_FIELD_ABS_MAX_PX = 12000;

/** ChatInput max auto-grow */
export const CHAT_INPUT_MAX_HEIGHT_PX = 120;
