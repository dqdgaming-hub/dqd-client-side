import { useEffect, useState } from "react";
import {
    getUpcomingEventBookings,
    cancelEventBooking
} from "../../api/userapi";

import BookingCard from "./BookingCard";
import QRCodeModal from "./QRCodeModal";

export default function UpcomingBookings() {

    const [bookings,setBookings]=useState([]);

    const [loading,setLoading]=useState(true);

    const [selected,setSelected]=useState(null);

    useEffect(()=>{

        loadBookings();

    },[]);

    const loadBookings=async()=>{

        try{

            const data=await getUpcomingEventBookings();

            setBookings(data);

        }finally{

            setLoading(false);

        }

    };

    const cancelBooking=async(id)=>{

        if(!window.confirm("Cancel this booking?"))
            return;

        try{

            await cancelEventBooking(id);

            loadBookings();

        }catch(err){

            alert(

                err.response?.data?.detail ||

                "Unable to cancel booking."

            );

        }

    };

    if(loading){

        return(

            <div style={styles.loading}>

                Loading Upcoming Bookings...

            </div>

        );

    }

    if(bookings.length===0){

        return(

            <div style={styles.empty}>

                <h2>No Upcoming Bookings</h2>

                <p>

                    Book an exclusive event to see it here.

                </p>

            </div>

        );

    }

    return(

        <>

        {

            bookings.map(booking=>(

                <BookingCard

                    key={booking.id}

                    booking={booking}

                    onCancel={cancelBooking}

                    onViewTicket={()=>setSelected(booking)}

                />

            ))

        }

        <QRCodeModal

            booking={selected}

            close={()=>setSelected(null)}

        />

        </>

    );

}

const styles={

loading:{

padding:80,

textAlign:"center",

fontSize:18

},

empty:{

padding:70,

background:"#161b22",

borderRadius:18,

textAlign:"center",

color:"#fff"

}

};