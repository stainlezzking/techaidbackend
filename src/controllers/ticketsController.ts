import { Ticket } from "../models/ticketmodel";
import { AutomatedTicketSystemFxn, updateSupportOpenTickets, updateTicketReassigned } from "../utils/general";
// import { AuthenticatedRequest } from "@types/user.d";
import { User } from "../models/usermodel";
import { Response } from "express";
import { AuthenticatedRequest } from "../@types/user";
import { SendNotification } from "../utils/notifications";
import { format } from "date-fns";

/*
@All autheticated users have this permission
@users
*/
export const getMyTickets = async function (req: AuthenticatedRequest, res: Response) {
  const ticket = await Ticket.find({ userId: req.user!._id }).populate("assignedTo", "fullname");
  res.json({ success: true, data: ticket });
  return;
};

/*
@get Assigned Tickets
@support
*/

export const getAssignedTickets = async function (req: AuthenticatedRequest, res: Response) {
  const ticket = await Ticket.find({ assignedTo: req.user!._id }).populate("userId");
  res.json({ success: true, data: ticket });
  return;
};

/*
@All autheticated users have this permission
@users
this should also make sure that it is a user that createf the ticket requesting it
*/
export const getTicketById = async function (req: AuthenticatedRequest, res: Response) {
  const ticket = await Ticket.findById(req.params.id).populate("assignedTo userId");
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
    displayId: format(new Date(), "yyMMdd") + `${Date.now().toString().slice(0, 4)}`,
  };
  const [system, createdTicket] = await Promise.all([ticketSystem!.save(), Ticket.create(newTicket)]);
  if (assingedStaffId) {
    const notification = `A new ticket with Id of ${newTicket.displayId} has been assigned to you`;
    SendNotification(createdTicket.id, assingedStaffId as any, notification);
  }
  res.json({ success: true, message: "created a new Ticket", ticket: createdTicket });
};

/*
all @authenticated users
*/
export const addNoteToTicket = async function (req: AuthenticatedRequest, res: Response) {
  const { id: ticketId } = req.params;
  const { message } = req.body;

  const user = await User.findById(req.user!._id);

  if (!message) {
    res.json({ success: false, error: "Message is required" });
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
  const currenduserId = user!._id as any;
  console.log(currenduserId.toString(), ticket.userId.toString(), ticket.assignedTo!.toString());
  let recipientId = currenduserId.toString() == ticket.userId.toString() ? ticket.assignedTo : ticket.userId;
  // displayId is a gimmick to match with the presentation
  const displayId = ticket.displayId ? ticket.displayId : format(new Date(), "yyMMdd") + ticket.id.replace(/[^0-9]/g, "").substring(0, 4);
  const notification = `${user!.fullname} left you a message on the ticket with Id ${displayId}`;
  if (recipientId) {
    // so if its not assigned, dont send the notification
    SendNotification(ticketId, recipientId as any, notification);
  }
  res.json({ success: true, message: "Note added successfully", notes: ticket.notes });
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
  const { data: status, _id } = req.body;
  const ticket = await Ticket.findByIdAndUpdate({ _id }, { status }, { new: true });
  if (status !== "in-progress") await updateSupportOpenTickets(status, req.user!._id.toString());

  //update the automatedSystem on the support openstatus and clonedStatus
  // const newTicket = {title, description, priority, userId : req.user!._id, }
  if (status == "resolved") {
    const notification = `Your ticket with id of ${ticket!.displayId} has be close, please leave a review`;
    SendNotification(ticket!.id, ticket!.userId as any, notification);
    // notify the user that the ticket has been updated and they can leave a review
  }
  res.json({
    success: true,
    message: `You updated the status of ticket with id of ${ticket?.displayId}`,
  });
  return;
};

export const assignTicket = async function (req: AuthenticatedRequest, res: Response) {
  const { email, ticketId, name } = req.body;
  const supportUser = await User.findOne({ email, role: "support" });
  if (!supportUser) {
    res.json({ success: false, message: "No Engineer was found with the email" });
    return;
  }
  await Ticket.updateOne({ _id: ticketId }, { assignedTo: supportUser._id });
  await updateTicketReassigned(req.user!._id.toString(), supportUser.id);
  const notification = `A ticket with was assigned to you from ${name}`;
  SendNotification(ticketId, supportUser.id as any, notification);
  res.json({ success: true, message: "Ticket re-assigned succefully" });
};
