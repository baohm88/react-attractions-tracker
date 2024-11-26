import { useCallback, useRef, useState } from "react";

import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import AvailablePlaces from "./components/AvailablePlaces.jsx";
import { fetchUserPlaces, updateUserPlaces } from "./http.js";
import ErrorPage from "./components/ErrorPage.jsx";
import Header from "./components/Header.jsx";
import { useFetch } from "./hooks/useFetch.js";

function App() {
    const selectedPlace = useRef();
    const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const {
        isFetching,
        error,
        fetchedData: userPlaces,
        setFetchedData: setUserPlaces,
    } = useFetch(fetchUserPlaces, []);

    function handleStartRemovePlace(place) {
        selectedPlace.current = place;
        setModalIsOpen(true);
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

        const prevPlaces = [...userPlaces];

        try {
            const updatedPlaces = [...prevPlaces, selectedPlace];
            await updateUserPlaces(updatedPlaces);
        } catch (error) {
            setUserPlaces(prevPlaces);
            setErrorUpdatingPlaces({
                message: error.message || "Failed to update places.",
            });
        }
    }

    const handleRemovePlace = useCallback(async () => {
        try {
            // Create the updated places array (do not update state yet)
            const updatedPlaces = userPlaces.filter(
                (place) => place.id !== selectedPlace.current.id
            );

            // First update the backend
            await updateUserPlaces(updatedPlaces);

            // If successful, update the local state
            setUserPlaces(updatedPlaces);

            // Close the modal
            setModalIsOpen(false);
        } catch (error) {
            // Handle backend errors gracefully
            setErrorUpdatingPlaces({
                message: error.message || "Failed to delete place.",
            });
        }
    }, [userPlaces, setUserPlaces]);

    function handleError() {
        setErrorUpdatingPlaces(null);
        setModalIsOpen(false);
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
                        onConfirm={handleError}
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
