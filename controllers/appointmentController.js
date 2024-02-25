const Appointment = require("../models/appointmentModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

const getallappointments = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { userId: req.query.search },
            { kirtankarId: req.query.search },
          ],
        }
      : {};

    const appointments = await Appointment.find(keyword)
      .populate("kirtankarId")
      .populate("userId");
    return res.send(appointments);
  } catch (error) {
    res.status(500).send("Unable to get kirtan");
  }
};

const getbookedappoinments = async (req, res) => {
  const { kirtankarId } = req.body;
  try {
    const bookedKirtans = await Appointment.find(kirtankarId);
    console.log("The booked details are - ",bookedKirtans);
    return res.status(200).json({ kirtans: bookedKirtans });
  } catch (error) {
    res.status(500).send("Unable to book kirtan");
  }
};

const bookappointment = async (req, res) => {
  try {
    //to check if kiratankar already have kirtan on particuler data
    const alreadyKirtan = await Appointment.findOne({
      date: req.body.date,
      kirtankarId: req.body.kirtankarId,
    });

    if (alreadyKirtan?.status == "Pending") {
      // console.log(alreadyKirtan);
      return res.status(409).json({ msg: "Appointment already exists" });
    }

    const appointment = await Appointment({
      date: req.body.date,
      time: req.body.time,
      kirtankarId: req.body.kirtankarId,
      userId: req.locals,
    });

    const usernotification = Notification({
      userId: req.locals,
      content: `You booked an kirtan with ${req.body.kirtankarname} for ${req.body.date} ${req.body.time}`,
    });

    await usernotification.save();

    const user = await User.findById(req.locals);

    const kirtankarnotification = Notification({
      userId: req.body.kirtankarId,
      content: `You have an kirtan with ${user.firstname} ${user.lastname} on ${req.body.date} at ${req.body.time}`,
    });

    await kirtankarnotification.save();

    const result = await appointment.save();
    return res.status(201).send(result);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Unable to book kirtan");
  }
};

const completed = async (req, res) => {
  try {
    const alreadyFound = await Appointment.findOneAndUpdate(
      { _id: req.body.appointid },
      { status: "Completed" }
    );

    const usernotification = Notification({
      userId: req.locals,
      content: `Your kirtan with ${req.body.kirtankarname} has been completed`,
    });

    await usernotification.save();

    const user = await User.findById(req.locals);

    const kirtankarnotification = Notification({
      userId: req.body.kirtankarId,
      content: `Your kirtan with ${user.firstname} ${user.lastname} has been completed`,
    });

    await kirtankarnotification.save();

    return res.status(201).send("Kirtan completed");
  } catch (error) {
    res.status(500).send("Unable to mark complete Kirtan");
  }
};

module.exports = {
  getallappointments,
  bookappointment,
  completed,
  getbookedappoinments,
};
