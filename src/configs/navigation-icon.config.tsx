import { IoTicketOutline } from "react-icons/io5";
import { FaRocketchat } from "react-icons/fa6";
import type { JSX } from 'react'
import { RiExchangeBoxLine } from "react-icons/ri";
import { PiHandDeposit, PiHandWithdrawLight } from "react-icons/pi";
import { MdOutlineDashboardCustomize, MdOutlineWorkHistory } from "react-icons/md";
import { TbShield, TbFileInvoice } from "react-icons/tb";
import { Settings, MessageCircle } from "lucide-react";
import { LuTicket } from "react-icons/lu";

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    dashboard: <MdOutlineDashboardCustomize />,
    exchange: <RiExchangeBoxLine />,
    inbox: <MessageCircle strokeWidth={1.5} />,
    deposit: <PiHandDeposit />,
    ticket: <LuTicket />,
    Viewticket: <LuTicket />,
    invoice: <TbFileInvoice />,
    withdrawal: <PiHandWithdrawLight />,
    transaction: <MdOutlineWorkHistory />,
    kyc: <TbShield />,
    setting: <Settings strokeWidth={1.5} />,
}

export default navigationIcon