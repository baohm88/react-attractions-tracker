import { useCallback, useEffect, useRef, useState } from "react";
import Places from "./components/Places.jsx";
import { AVAILABLE_PLACES } from "./data.js";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";

import { sortPlacesByDistance } from "./loc.js";
import Header from "./components/Header.jsx";

function App() {
    // const modal = useRef();
    const selectedPlace = useRef();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const [pickedPlaces, setPickedPlaces] = useState(() => {
        const storedIds =
            JSON.parse(localStorage.getItem("selectedPlaces")) || [];
        return storedIds
            .map((id) => AVAILABLE_PLACES.find((place) => place.id === id))
            .filter((place) => place);
    });

    const [availablePlaces, setAvailablePlaces] = useState([]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const sortedPlaces = sortPlacesByDistance(
                    AVAILABLE_PLACES,
                    position.coords.latitude,
                    position.coords.longitude
                );

                setAvailablePlaces(sortedPlaces);
            },
            (error) => {
                console.error("Geolocation error:", error);
                setAvailablePlaces(AVAILABLE_PLACES); // Fallback to unsorted places
            }
        );
    }, []);

    function updateLocalStorage(pickedPlaces) {
        const ids = pickedPlaces.map((place) => place.id);
        localStorage.setItem("selectedPlaces", JSON.stringify(ids));
    }

    function handleStartRemovePlace(id) {
        // modal.current.open();
        setModalIsOpen(true);
        selectedPlace.current = id;
    }

    function handleStopRemovePlace() {
        // modal.current.close();
        setModalIsOpen(false);
    }

    function handleSelectPlace(id) {
        setPickedPlaces((prevPickedPlaces) => {
            if (prevPickedPlaces.some((place) => place.id === id)) {
                console.warn("Place already picked: ", id);
                return prevPickedPlaces;
            }
            const newPlace = AVAILABLE_PLACES.find((place) => place.id === id);
            const updatedPlaces = [newPlace, ...prevPickedPlaces];
            updateLocalStorage(updatedPlaces);
            return updatedPlaces;
        });
    }

    const handleRemovePlace = useCallback(() => {
        setPickedPlaces((prevPickedPlaces) => {
            const updatedPlaces = prevPickedPlaces.filter(
                (place) => place.id !== selectedPlace.current
            );
            updateLocalStorage(updatedPlaces);
            return updatedPlaces;
        });
        // modal.current.close();
        setModalIsOpen(false);
    }, []);

    return (
        <>
            <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
                <DeleteConfirmation
                    onCancel={handleStopRemovePlace}
                    onConfirm={handleRemovePlace}
                    autoConfirmTime={4000}
                />
            </Modal>
            <Header />

            <main>
                <Places
                    title="I'd like to visit ..."
                    fallbackText={
                        "Select the places you would like to visit below."
                    }
                    places={pickedPlaces}
                    onSelectPlace={handleStartRemovePlace}
                />
                <Places
                    title="Available Places"
                    places={availablePlaces}
                    fallbackText={
                        availablePlaces.length === 0
                            ? "Loading..."
                            : "Sorting places by distance..."
                    }
                    onSelectPlace={handleSelectPlace}
                />
            </main>
        </>
    );
}

export default App;
