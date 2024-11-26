import { useEffect, useState } from "react";

export function useFetch(fetchFn, initialValue) {
    const [isFetching, setIsFetching] = useState();
    const [error, setError] = useState();
    const [fetchedData, setFetchedData] = useState(initialValue);

    // useEffect(() => {
    //     async function fetchData() {
    //         setIsFetching(true);
    //         try {
    //             const data = await fetchFn();
    //             setFetchedData(data);
    //         } catch (error) {
    //             setError({
    //                 message: error.message || "Failed to fetch data.",
    //             });
    //         }

    //         setIsFetching(false);
    //     }

    //     fetchData();
    // }, [fetchFn]);

    useEffect(() => {
        let isMounted = true; // Prevent state updates after unmount
        async function fetchData() {
            setIsFetching(true);
            try {
                const data = await fetchFn();
                if (isMounted) setFetchedData(data);
            } catch (error) {
                if (isMounted) {
                    setError({
                        message: error.message || "Failed to fetch data.",
                    });
                }
            }
            if (isMounted) setIsFetching(false);
        }

        fetchData();
        return () => {
            isMounted = false; // Cleanup to prevent memory leaks
        };
    }, [fetchFn]);
    return { isFetching, error, fetchedData, setFetchedData };
}
