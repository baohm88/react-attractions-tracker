import { useCallback, useEffect, useRef, useState } from "react";

import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import AvailablePlaces from "./components/AvailablePlaces.jsx";
import { fetchUserPlaces, updateUserPlaces } from "./http.js";
import ErrorPage from "./components/ErrorPage.jsx";
import Header from "./components/Header.jsx";

function App() {
    const selectedPlace = useRef();
    fetchUserPlaces;

    const [userPlaces, setUserPlaces] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState();
    const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        async function fetchPlaces() {
            setIsFetching(true);
            try {
                const places = await fetchUserPlaces();
                setUserPlaces(places);
            } catch (error) {
                setError({
                    message: error.message || "Failed to fetch user places.",
                });
            }

            setIsFetching(false);
        }

        fetchPlaces();
    }, []);

    function handleStartRemovePlace(place) {
        setModalIsOpen(true);
        selectedPlace.current = place;
    }

    function handleStopRemovePlace() {
        setModalIsOpen(false);
    }

    async function handleSelectPlace(selectedPlace) {
        setUserPlaces((prevPickedPlaces) => {
            if (
                prevPickedPlaces.some((place) => place.id === selectedPlace.id)
            ) {
                return prevPickedPlaces;
            }
            return [selectedPlace, ...prevPickedPlaces];
        });

        try {
            const updatedPlaces = [...userPlaces, selectedPlace];
            await updateUserPlaces(updatedPlaces);
        } catch (error) {
            setUserPlaces(userPlaces);
            setErrorUpdatingPlaces({
                message: error.message || "Failed to update places.",
            });
        }
    }

    const handleRemovePlace = useCallback(
        async function handleRemovePlace() {
            const updatedPlaces = userPlaces.filter(
                (place) => place.id !== selectedPlace.current.id
            );

            setUserPlaces(updatedPlaces);

            try {
                await updateUserPlaces(updatedPlaces);
            } catch (error) {
                setUserPlaces(userPlaces);
                setErrorUpdatingPlaces({
                    message: error.message || "failed to delete place.",
                });
            }

            setModalIsOpen(false);
        },
        [userPlaces]
    );

    function handleError() {
        setErrorUpdatingPlaces(null);
    }

    return (
        <>
            <Modal open={errorUpdatingPlaces} onClose={handleError}>
                {errorUpdatingPlaces && (
                    <ErrorPage
                        title="An error occurred"
                        message={errorUpdatingPlaces.message}
                        onConfirm={handleError}
                    />
                )}
            </Modal>
            <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
                <DeleteConfirmation
                    onCancel={handleStopRemovePlace}
                    onConfirm={handleRemovePlace}
                    autoConfirmTime={4000}
                />
            </Modal>

            <Header />
            <main>
                {error ? (
                    <ErrorPage
                        title="An error occurred!"
                        message={error.message}
                    />
                ) : (
                    <Places
                        title="I'd like to visit ..."
                        fallbackText="Select the places you would like to visit below."
                        isLoading={isFetching}
                        loadingText="Fetching your places..."
                        places={userPlaces}
                        onSelectPlace={handleStartRemovePlace}
                    />
                )}

                <AvailablePlaces onSelectPlace={handleSelectPlace} />
            </main>
        </>
    );
}

export default App;
