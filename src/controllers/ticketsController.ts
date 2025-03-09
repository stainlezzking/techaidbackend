import { Ticket } from "../models/ticketmodel";
import { AutomatedTicketSystemFxn } from "../utils/general";
// import { AuthenticatedRequest } from "@types/user.d";
import { User } from "../models/usermodel";
import { Response } from "express";
import { AuthenticatedRequest } from "../@types/user";

/*
@All autheticated users have this permission
@users
*/
export const getMyTickets = async function (req: AuthenticatedRequest, res: Response) {
  const ticket = await Ticket.find({ userId: req.user!._id });
  res.json({ success: true, data: ticket });
  return;
};

/*
@users
Create Ticket
*/
// I need to automatically assign the ticket to support staffs
export const createNewTicket = async function (req: AuthenticatedRequest, res: Response) {
  const { title, description, priority } = req.body;
  const { ticketSystem, assingedStaffId } = await AutomatedTicketSystemFxn();
  const newTicket = {
    title,
    description,
    priority,
    userId: req.user!._id,
    assignedTo: assingedStaffId,
  };
  const [system, createdTicket] = await Promise.all([ticketSystem!.save(), Ticket.create(newTicket)]);
  res.json({ success: true, message: "created a new Ticket", ticket: createdTicket });
};

/*
all @authenticated users
*/
export const addNoteToTicket = async function (req: AuthenticatedRequest, res: Response) {
  const { ticketId } = req.params;
  const { message } = req.body;

  const user = await User.findById(req.user!._id);

  if (!message) {
    res.json({ error: "Message is required" });
    return;
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    res.json({ success: false, error: "This ticket was not found" });
    return;
  }
  ticket.notes!.push({
    id: user!.id,
    name: user!.fullname,
    message,
  });

  await ticket.save();

  res.json({ success: true, message: "Note added successfully", ticket });
};

/*
 @suppport
*/
export const myAssignedSupport = async function (req: AuthenticatedRequest, res: Response) {
  const tickets = await Ticket.find({ user: req.user!._id });
  res.json({ success: true, tickets });
};

/*
@admin and @support
*/
export const updateTicketStatus = async function (req: AuthenticatedRequest, res: Response) {
  // after closing a ticket
  //update the automatedSystem on the support openstatus
  // const newTicket = {title, description, priority, userId : req.user!._id, }
};
