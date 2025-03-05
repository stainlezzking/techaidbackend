import { Request, Response } from "express";
import { AutomatedTicketSystem, Ticket } from "../models/ticketmodel";
import { AutomatedTicketSystemFxn } from "../utils/general";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      email: string;
      role: string;
      _id: string;
    };
  }
}

/*
@All autheticated users have this permission
@users
*/
export const getMyTickets = async function (req: Request, res: Response) {
  //   const ticket = await Ticket.find({ userId: req.user!._id });
  //   res.json({ success: true, data: ticket });
  return;
};

/*
@users
Create Ticket
*/
// I need to automatically assign the ticket to support staffs
export const createNewTicket = async function (req: Request, res: Response) {
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
export const addNoteToTicket = async function (req: Request, res: Response) {};

/*
 @suppport
*/
export const myAssignedSupport = async function (req: Request, res: Response) {};

/*
@admin and @support
*/
export const updateTicketStatus = async function (req: Request, res: Response) {
  // after closing a ticket
  //update the automatedSystem on the support openstatus
  // const newTicket = {title, description, priority, userId : req.user!._id, }
};
