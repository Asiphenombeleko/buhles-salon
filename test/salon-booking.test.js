import assert from 'assert';
import SalonBooking from '../salon-booking.js';
import pgPromise from 'pg-promise';

// TODO configure this to work.
const DATABASE_URL = process.env.DATABASE_URL; 
// || "postgresql://localhost:5432/salon_test";

const config = { 
    connectionString: DATABASE_URL
}

const pgp = pgPromise();
const db = pgp(config);

let booking = SalonBooking(db);

describe("The Booking Salon", function () {

    beforeEach(async function () {
        await db.none(`delete from booking`);
    });

    it("should be able to list treatments", async function () {
        const treatments = await booking.findAllTreatments();
        assert.equal(4, treatments.length); // Check if there are 4 treatments
    });

    it("should be able to find a stylist", async function () {
        const stylist = await booking.findStylist("***");
        assert.equal(null, stylist); // Check if stylist is not found
    });

    it("should be able to allow a client to make a booking", async function () {
        const client = await booking.findClient("***");
        const treatmentId = 1; // Replace with the actual treatment ID
        const date = '2023-01-01'; // Replace with the actual date
        const time = '12:00'; // Replace with the actual time

        const newBooking = await booking.makeBooking(client.id, treatmentId, date, time);

        const bookings = await booking.findClientBookings(client.id);
        assert.equal(1, bookings.length); // Check if the booking is made successfully
    });

    it("should be able to get client booking(s)", async function () {
        const client1 = await booking.findClient("***");
        const client2 = await booking.findClient("***");
        
        const treatment1 = await booking.findTreatment("***");
        const treatment2 = await booking.findTreatment("***");

        await booking.makeBooking(client1.id, treatment1.id, date, time);
        await booking.makeBooking(client1.id, treatment2.id, date, time);
        await booking.makeBooking(client2.id, treatment1.id, date, time);

        const clientBookings = await booking.findClientBookings(client1.id);
        assert.equal(2, clientBookings.length); // Check if client1 has 2 bookings
    });

    it("should be able to get bookings for a date", async function () {
        const client1 = await booking.findClient("***");
        const client2 = await booking.findClient("***");

        const treatment1 = await booking.findTreatment("***");
        const treatment2 = await booking.findTreatment("***");
        const treatment3 = await booking.findTreatment("***");

        await booking.makeBooking(client1.id, treatment1.id, date, time);
        await booking.makeBooking(client1.id, treatment2.id, date, time);
        await booking.makeBooking(client2.id, treatment3.id, date, time);

        const bookings = await booking.findAllBookings({ date, time });
        assert.equal(3, bookings.length); // Check if there are 3 bookings
    });

    it("should be able to find the total income for a day", async function() {
        const date = '2023-01-01'; // Replace with the actual date
        const totalIncome = await booking.totalIncomeForDay(date);
        assert.equal(0, totalIncome); // Replace 0 with the expected total income
    });

    it("should be able to find the most valuable client", async function() {
        const mostValuableClient = await booking.mostValuebleClient();
        assert.equal(null, mostValuableClient); // Replace with the expected client
    });

    it("should be able to find the total commission for a given stylist", async function() {
        const stylistId = 1; // Replace with the actual stylist ID
        const date = '2023-01-01'; // Replace with the actual date
        const totalCommission = await booking.totalCommission(date, stylistId);
        assert.equal(0, totalCommission); // Replace 0 with the expected total commission
    });

    after(function () {
        db.$pool.end();
    });

});
