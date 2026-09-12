import { useEffect, useState } from "react";
import { getPreviousEventBookings } from "../../api/userapi";

import BookingCard from "./BookingCard";
import QRCodeModal from "./QRCodeModal";

export default function PreviousBookings() {

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {

        loadBookings();

    }, []);

    const loadBookings = async () => {

        try {

            const data = await getPreviousEventBookings();

            setBookings(data);

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div style={styles.loading}>

                Loading Previous Bookings...

            </div>

        );

    }

    if (bookings.length === 0) {

        return (

            <div style={styles.empty}>

                <h2>No Previous Bookings</h2>

                <p>

                    Your completed and attended events will appear here.

                </p>

            </div>

        );

    }

    return (

        <>

            {

                bookings.map(booking => (

                    <BookingCard

                        key={booking.id}

                        booking={booking}

                        onViewTicket={() => setSelected(booking)}

                    />

                ))

            }

            <QRCodeModal

                booking={selected}

                close={() => setSelected(null)}

            />

        </>

    );

}

const styles = {

    loading: {

        padding: 80,

        textAlign: "center",

        color: "#fff",

        fontSize: 18

    },

    empty: {

        padding: 80,

        textAlign: "center",

        background: "#161b22",

        color: "#fff",

        borderRadius: 18

    }

};