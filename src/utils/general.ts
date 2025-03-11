import jwt from "jsonwebtoken";

export default interface CreadentialsCheckpayload extends StaffSignupType {
  secret: {
    secret: string;
    encoding: string;
  };
}
import { StaffSignupType } from "../validator/staffschema";
import { NextFunction, Request, Response } from "express";
import { AutomatedTicketSystem } from "../models/ticketmodel";

export const signJwtToken = function (payload: { email: string; role: string; _id: string }, exp: number) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: exp });
};

export const signJwtCredentialValidation = function (payload: CreadentialsCheckpayload, exp: number) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: exp });
};

export const verifyJwtToken = function (token: string) {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    return decoded;
  } catch (error) {
    return false;
  }
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const AutomatedTicketSystemFxn = async function () {
  const ticketSystem = await AutomatedTicketSystem.findOne({});
  const assingedStaffId = ticketSystem!.supportStaffs[ticketSystem!.currentIndex].supportId;
  const lastIndex = ticketSystem!.currentIndex >= ticketSystem!.supportStaffs.length - 1;
  //  getting the next index for staff to be assigned new ticket
  const nextIndex = lastIndex ? 0 : ticketSystem!.currentIndex + 1;
  // updating the assigned staffs open index
  ticketSystem!.supportStaffs[ticketSystem!.currentIndex].openTickets++;
  // updating the systems current index
  ticketSystem!.currentIndex = nextIndex;
  return { ticketSystem, assingedStaffId };
};

export const updateSupportOpenTickets = async function (status: string, staffId: string) {
  const ticketSystem = await AutomatedTicketSystem.findOne({});
  ticketSystem!.supportStaffs.forEach((staff) => {
    if (staff.supportId.toString() == staffId) {
      staff.openTickets = status == "open" ? staff.openTickets + 1 : status == "resolved" ? staff.openTickets - 1 : staff.openTickets;
    }
  });
  await ticketSystem!.save();
  return;
};

export const updateTicketReassigned = async function (passer: string, receiver: string) {
  const ticketSystem = await AutomatedTicketSystem.findOne({});
  ticketSystem!.supportStaffs.forEach((staff) => {
    if (staff.supportId.toString() == passer) {
      staff.openTickets = staff.openTickets - 1;
    }
    if (staff.supportId.toString() == receiver) {
      staff.openTickets = staff.openTickets + 1;
    }
  });
  await ticketSystem!.save();
  return;
};
