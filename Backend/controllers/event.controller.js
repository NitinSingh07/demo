import Event from "../models/event.model.js";

// Create an event
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location } = req.body;

    if (!title || !description || !date || !time || !location) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log(req.user);
    const event = new Event({
      title,
      description,
      date,
      time,
      location,
      organizer: req.user.id,
    });

    console.log(event); // Debugging: Check event object

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error.message);
    res.status(500).json({ error: "Error creating event" });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("organizer", "username");
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Error fetching events" });
  }
};

// Get a single event by ID
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "username")
      .populate("attendees", "username");
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Error fetching event" });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.organizer.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    Object.assign(event, req.body);
    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Error updating event" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    // Check if the event ID is provided
    const eventId = req.params.id;
    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    // Find and delete the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if organizer field exists
    if (!event.organizer) {
      return res.status(400).json({ error: "Event has no organizer assigned" });
    }

    // Ensure req.user is properly set
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check if the user is the organizer of the event
    if (event.organizer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete the event using findByIdAndDelete
    await Event.findByIdAndDelete(eventId);
    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    // Log error for debugging
    console.error("Error deleting event:", error.message);
    res.status(500).json({ error: "Error deleting event" });
  }
};


// Register for an event
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ error: "Already registered" });
    }

    event.attendees.push(req.user.id);
    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Error registering for event" });
  }
};

export {
  createEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
};
