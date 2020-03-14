//Sample data for Assignment 3

//The following is an example of an array of two events. 
var events = [
    { id: 0, name: "The Whistlers", description: "Romania, 2019, 97 minutes", location: "Bio Paradís, Salur 1", capacity: 40, startDate: new Date(Date.UTC(2020, 02, 03, 22, 0)), endDate: new Date(Date.UTC(2020, 02, 03, 23, 45)), bookings: [0,1,2] },
    { id: 1, name: "HarpFusion: Bach to the Future", description: "Harp ensemble", location: "Harpa, Hörpuhorn", capacity: 100, startDate: new Date(Date.UTC(2020, 02, 12, 15, 0)), endDate: new Date(Date.UTC(2020, 02, 12, 16, 0)), bookings: [] }
];

//The following is an example of an array of three bookings.
var bookings = [
    { id: 0, firstName: "John", lastName: "Doe", tel: "+3541234567", email: "", spots: 3},
    { id: 1, firstName: "Jane", lastName: "Doe", tel: "", email: "jane@doe.doe", spots: 1},
    { id: 2, firstName: "Meðaljón", lastName: "Jónsson", tel: "+3541111111", email: "mj@test.is", spots: 5}
];

var next_events_id = 2; // Next event will have the id 2, then 1 gets added to this when we create a new event
var next_bookings_id = 3; // Next booking will have the id 3, then 1 gets added to this when we create a new booking

const express = require('express');
const app = express();
var bodyParser = require('body-parser');

// const hostname = 'localhost';
const port = process.env.PORT || 3000; // Heroku PORT or 3000
const default_path = '/api/v1/'; // Set up default path so we don't have to write '/api/v1/' over and over again

// POST — add new data
// PUT — replace existing data
// PATCH — update some existing data fields
// DELETE — delete existing data

app.use(bodyParser.json());


app.get(default_path, (req, res) => {
	res.status(200).send("Up and running"); // Just a default message that tells me the server's running
});

app.use('*', (req, res, next) => {
	console.log(req.method + " to " + req.originalUrl); // (Type of request) to (URL) e.g.: POST to /events
	next();
});

app.get(default_path + 'events', (req, res) => {
	// Gets every event
	var ret_str = ""; // Initialize return string
	for (var i = 0; i < events.length; i++) { // Iterate through list of events
		ret_str += "Name: \"" + events[i].name + "\"\n"; // Add parameter value to the return string
		ret_str += "ID: " + events[i].id + "\n"; // Add parameter value to the return string
		ret_str += "Capacity: " + events[i].capacity + "\n"; // Add parameter value to the return string
		ret_str += "Start Date: " + events[i].startDate + "\n"; // Add parameter value to the return string
		ret_str += "End Date: " + events[i].endDate + "\n\n"; // Add parameter value to the return string
	}
	return res.status(200).send(ret_str); // Send the return string
});

app.get(default_path + 'events/:id', (req, res) => {
	// Gets specific event
	for (var i = 0; i < events.length; i++) { // Iterate through list of events
		if (events[i].id == req.params.id) {
			return res.status(200).send(events[i]); // Returns all attributes of event
		}
	}
	return res.status(404).send('There is no event with the id ' + req.params.id); // Raise an error that says that even doesn't exist
});

app.get(default_path + 'events/:id/bookings', (req, res) => {
	// Gets every booking from specific event
	for (var e = 0; e < events.length; e++) { // Iterate through list of events
		if (events[e].id == req.params.id) {
			var event = events[e]; // Get event
			var bookings_list = []; // Initialize bookings list
			for (var i = 0; i < event.bookings.length; i++) { // Iterate through the event's bookings list
				booking_id = event.bookings[i]; // Get the current booking id
				for (var j = 0; j < bookings.length; j++) { // Look through the bookings
					if (booking_id == bookings[j].id) { // If the booking is in event bookings
						bookings_list.push(bookings[j]); // Push the booking into the bookings list
						break; // If it found the booking, break from the for loop as the booking won't be any further into the loop
					}
				}
			}
			return res.status(200).send(bookings_list); // Return bookings list and end the request
		}
}
	return res.status(404).send('There is no event with the id ' + req.params.id); // Otherwise we say that the event does not exist
});

app.get(default_path + 'events/:event_id/bookings/:booking_id', (req, res) => {
	// Gets a booking from an event
	for (var e = 0; e < events.length; e++) { // Iterate through list of events
		if (events[e].id == req.params.id) {
			var event = events[e]; // Get event
			for (var j = 0; j < event.bookings.length; j++) { // Iterate through all bookings within event
				if (event.bookings[j] == req.params.booking_id) { // Check if the booking is in event
					return res.status(200).send(bookings[req.params.booking_id]); // Return the booking
				}
			}
			return res.status(404).send('There is no booking with the id ' + req.params.booking_id + ' in event ' + req.params.event_id); // Raise an error and say that there is no booking with given id within the chosen event
		}
	}
	return res.status(404).send('There is no event with the id ' + req.params.event_id); // Otherwise we say that the event does not exist
});

app.post(default_path + 'events', (req, res) => {
	// Creates a new event
	if (req.body === undefined || req.body.name === undefined || req.body.capacity === undefined || req.body.startDate === undefined || req.body.endDate === undefined) {
		return res.status(400).send("You need a name, capacity, startDate and endDate");
	}
	else {
		var name = req.body.name; // Initialize object's name
		if (checkInt(req.body.capacity) && req.body.capacity > 0) {
			var capacity = req.body.capacity; // Initialize object's capacity
		}
		else {
			return res.status(400).send("Capacity must be a whole number over 0");
		}
		// var startDate = req.body.startDate; // Initialize object's startDate
		if (checkDate(req.body.startDate)) {
			var startDate = new Date(req.body.startDate * 1000);
			if (startDate < Date.now()) {
				return res.status(400).send("startDate must be after current date");
			}
		}
		else {
			return res.status(400).send("startDate is invalid, must be in milliseconds");
		}
		if (checkDate(req.body.endDate)) {
			var endDate = new Date(req.body.endDate * 1000); // Initialize object's endDate
			if (endDate < startDate) {
				return res.status(400).send("endDate must be after startDate");
			}
		}
		else {
			return res.status(400).send("endDate is invalid, must be in milliseconds");
		}
		if (req.body.description === undefined) { // If it's not given, set it as an empty string
			var description = "";
		}
		else {
			var description = req.body.description;
		}
		if (req.body.location === undefined) { // If it's not given, set it as an empty string
			var location = "";
		}
		else {
			var location = req.body.location;
		}
		var bookings = []; // Initialize empty bookings array
		var new_event = {id: next_events_id, name: name, description: description, location: location, capacity: capacity, startDate: startDate, endDate: endDate, bookings: bookings}; // Create new object
		events.push(new_event); // Add the new event into the events list
		next_events_id++; // Set next event id
		return res.status(201).send(new_event); // Return affirmation, and the event
	}
});

app.post(default_path + 'events/:id/bookings', (req, res) => {
	// Creates a new booking for an event
	if (req.body === undefined || req.body.firstName === undefined || req.body.lastName === undefined || req.body.spots === undefined || (req.body.tel === undefined && req.body.email === undefined)) {
		return res.status(400).send("You need a firstName, lastName, spots and tel and/or email");
	}
	else {
		for (var e = 0; e < events.length; e++) { // Iterate through list of events
			if (events[e].id == req.params.id) {
				var event = events[e]; // Get event
				if (req.body.tel === undefined) {
					req.body.tel = "";
				}
				else if (!checkInt(req.body.tel)) {
					return res.status(400).send("Telephone must be a whole number");
				}
				if (req.body.email === undefined) {
					req.body.email = "";
				}
				if (req.body.spots > 0) {
					if (!checkCapacity(event, req.body.spots)) {
						return res.status(400).send("Amount of spots can not be higher than the amount of the remaining capacity.");
					}
				}
				else {
					return res.status(400).send("Amount of spots has to be higher than 0.");
				}
				var new_booking = {id: next_bookings_id, firstName: req.body.firstName, lastName: req.body.lastName, tel: req.body.tel, email: req.body.email, spots: req.body.spots}; // Create new object with given parameters
				bookings.push(new_booking); // Push the new booking object onto the bookings array
				event.bookings.push(next_bookings_id); // Push the new booking object's id onto event's bookings
				next_bookings_id++; // Add 1 to the next_bookings_id
				return res.status(201).send(new_booking); // Return affirmation and the new booking
			}
		}
		return res.status(404).send("There is no event with the id " + req.params.id); // If event is not found, return fail state
	}
});

app.put(default_path + 'events/:id', (req, res) => {
	// Completely updates an event
	if (req.body === undefined || req.body.name === undefined || req.body.capacity === undefined || req.body.startDate === undefined || req.body.endDate === undefined || req.body.description === undefined || req.body.location === undefined) {
		return res.status(400).send("You need a name, capacity, description, location, startDate and endDate");
	}
	else {
		for (var e = 0; e < events.length; e++) { // Iterate through list of events
			if (events[e].id == req.params.id) {
				var event = events[e]; // Get event
				if (event.bookings.length == 0) {
					event.name = req.body.name; //Set event's name
					event.capacity = req.body.capacity; // Set event's capacity
					// event.startDate = req.body.startDate; // Set event's startDate
					if (checkDate(req.body.startDate)) {
						var startDate = new Date(req.body.startDate * 1000);
						if (startDate < Date.now()) {
							return res.status(400).send("startDate must be after current date");
						}
					}
					else {
						return res.status(400).send("startDate is invalid, must be in milliseconds");
					}
					if (checkDate(req.body.endDate)) {
						var endDate = new Date(req.body.endDate * 1000); // Initialize object's endDate
						if (endDate < startDate) {
							return res.status(400).send("endDate must be after startDate");
						}
					}
					else {
						return res.status(400).send("endDate is invalid, must be in milliseconds");
					}
					event.description = req.body.description; // Set event's description
					event.location = req.body.location; // Set event's location
					return res.status(200).send(events[event.id]); // Send affirmation and the updated event
				}
				return res.status(400).send("There are bookings booked to the event."); // If event includes bookings, say so
			}
		}
		return res.status(404).send("There is no event with the id " + req.params.id); // If the event doesn't exist, say so
	}
});

app.delete(default_path + 'events', (req, res) => {
	// Deletes every event
	var events_arr = []; // Initialize an empty array of events
	for (var i = 0; i < events.length; i++) { // Iterate through all events
		var curr_event = events[i] // Set current event
		for (var j = 0; j < curr_event.bookings.length; j++) { // Iterate through event's bookings ids
			for (var l = 0; l < bookings.length; l++) { // Iterate through bookings
				if (bookings[l].id == curr_event.bookings[j]) { // If booking
					curr_event.bookings[j] = bookings[l]; // Set the event's booking as the complete booking object
					bookings.splice(l, 1); // Remove the booking from the bookings array, as it can't be in any other event
					break; // Break, as we don't need to iterate any more through the bookings list
				}
			}
		}
		events_arr.push(curr_event); // Push the event onto the events array
	}
	bookings.length = 0; // Empty the bookings array (This is just a failsafe, if the splice fails)
	events.length = 0; // Empty the events array
	return res.status(200).send(events_arr); // Return the array of events
});

app.delete(default_path + 'events/:id', (req, res) => {
	// Deletes event
	for (var e = 0; e < events.length; e++) { // Iterate through list of events
		if (events[e].id == req.params.id) {
			var event = events[e]; // Get event
			if (event.id == req.params.id) { // Check if the event exists
				var bookings_length = event.bookings.length; // Find the length of bookings
				if (bookings_length == 0) { // Check if bookings is empty
					var deleted_event = event; // Get the event that is to be deleted
					events.splice(i, 1); // Throw the object(event) from array
					return res.status(200).send(deleted_event); // Return the deleted event
				}
				else { // If the event has bookings
					return res.status(400).send("The event can not have any bookings, there are currently " + event.bookings.length + " bookings associated with the event."); // Say that it failed, and how many bookings are booked to the event.
				}
			}
		}
	}
	return res.status(404).send("There is no event with the id " + req.params.id); // If the event doesn't exist, say so
});

app.delete(default_path + 'events/:id/bookings', (req, res) => {
	// Deletes all bookings from event
	for (var e = 0; e < events.length; e++) { // Iterate through list of events
		if (events[e].id == req.params.id) {
			var event = events[e]; // Get event
			var bookings_list = []; // Initialize bookings list
			for (var i = 0; i < event.bookings.length; i++) { // Iterate through the event's bookings list
				booking_id = event.bookings[i]; // Get the current booking id
				for (var j = 0; j < bookings.length; j++) { // Look through the bookings
					if (booking_id == bookings[j].id) { // If the booking is in event bookings
						bookings_list.push(bookings[j]); // Push the booking into the bookings list
						bookings.splice(j, 1); // Remove the booking from the list
						break;
					}
				}
			}
			event.bookings.length = 0; // Empty the bookings list
			return res.status(200).send(bookings_list); // Return bookings list and end the request
		}
	}
	return res.status(404).send('There is no event with the id ' + req.params.id); // Otherwise we say that the event does not exist
});

app.delete(default_path + 'events/:events_id/bookings/:bookings_id', (req, res) => {
	// Deletes specific booking from event
	for (var e = 0; e < events.length; e++) { // Iterate through list of events
		if (events[e].id == req.params.id) {
			var event = events[e]; // Get event
			for (var j = 0; j < event.bookings.length; j++) {
				if (event.bookings[j] == req.params.bookings_id) {
					event.bookings.splice(j, 1);
					for (var l = 0; l < bookings.length; l++) {
						if (bookings[l].id == req.params.bookings_id) {
							var deleted_booking = bookings[l];
							bookings.splice(l, 1);
							return res.status(200).send(deleted_booking);
						}
					}
				}
			}
			return res.status(404).send("Event " + req.params.events_id + " has no booking with the id " + req.params.bookings_id); // If the booking doesn't exist, say so
		}
	}
	return res.status(404).send("There is no event with the id " + req.params.events_id); // If the event doesn't exist, say so
});

app.use('*', (req, res) => {
	res.status(405).send('Operation not supported');
});

app.listen(port, () => {
	console.log('Express app listening on port ' + port);
});

function checkDate(date_in_mills) {
	var d = new Date(date_in_mills * 1000); // Initalize date for checking
	return (d instanceof Date && !isNaN(d)); // Returns true if correct date format
}

function checkInt(val) {
	return (!isNaN(val) && val % 1 == 0); // Returns true if number is integer
}

function checkCapacity(obj, spots) {
	var capacity = obj.capacity; // Get total capacity
	for (var i = 0; i < obj.bookings.length; i++) {
		var booking_spots = bookings[obj.bookings[i]].spots; // Get amount of spots in each booking
		capacity = capacity - booking_spots; // Remove amount of spots in each booking from the total capacity
	}
	console.log(capacity);
	console.log(spots);
	return (capacity >= spots); // Returns true if there is enough capacity for the amount of spots asked for
}