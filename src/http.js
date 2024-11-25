export async function fetchAvailablePlaces() {
    const res = await fetch("https://placepicker-j2j0.onrender.com/places");
    const resData = await res.json();

    if (!res.ok) {
        throw new Error("Failed to fetch places");
    }

    return resData.places;
}

export async function fetchUserPlaces() {
    const res = await fetch(
        "https://placepicker-j2j0.onrender.com/user-places"
    );
    const resData = await res.json();

    if (!res.ok) {
        throw new Error("Failed to fetch user places");
    }

    return resData.places;
}

export async function updateUserPlaces(places) {
    const res = await fetch(
        "https://placepicker-j2j0.onrender.com/user-places",
        {
            method: "PUT",
            body: JSON.stringify({ places }),
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const resData = await res.json();

    if (!res.ok) {
        throw new Error("Failed to updated user data.");
    }

    return resData.message;
}
