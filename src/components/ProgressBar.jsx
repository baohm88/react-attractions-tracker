import { useEffect } from "react";

export default function ProgressBar({
    timer,
    remainingTime,
    paused,
    onPause,
    onResume,
    onTimeUpdate,
}) {
    useEffect(() => {
        if (paused) return;

        const interval = setInterval(() => {
            onTimeUpdate((prevTime) => Math.max(prevTime - 100, 0));
        }, 100);

        return () => {
            clearInterval(interval);
        };
    }, [paused, ontimeupdate]);

    return (
        <div onMouseEnter={onPause} onMouseLeave={onResume}>
            <progress
                value={remainingTime}
                max={timer}
                aria-label="Time remaining to auto-confirm"
                aria-live="polite"
            />
        </div>
    );
}
