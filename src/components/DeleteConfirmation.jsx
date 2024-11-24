import { useEffect, useState } from "react";
import ProgressBar from "./ProgressBar";

export default function DeleteConfirmation({
    onConfirm,
    onCancel,
    autoConfirmTime = 3000,
}) {
    const [paused, setPaused] = useState(false);
    const [remainingTime, setRemainingTime] = useState(autoConfirmTime);

    useEffect(() => {
        if (paused) return;

        const timer = setTimeout(() => {
            onConfirm();
        }, remainingTime);

        return () => {
            clearTimeout(timer);
        };
    }, [onConfirm, remainingTime, paused]);

    function handlePause() {
        setPaused(true);
    }

    function handleResume() {
        setPaused(false);
    }

    return (
        <div id="delete-confirmation">
            <h2>Are you sure?</h2>
            <p>Do you really want to remove this place?</p>
            <div id="confirmation-actions">
                <button onClick={onCancel} className="button-text">
                    No
                </button>
                <button onClick={onConfirm} className="button">
                    Yes
                </button>
            </div>
            <ProgressBar
                timer={autoConfirmTime}
                remainingTime={remainingTime}
                paused={paused}
                onPause={handlePause}
                onResume={handleResume}
                onTimeUpdate={setRemainingTime}
            />
        </div>
    );
}
