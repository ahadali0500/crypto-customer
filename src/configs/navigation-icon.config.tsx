import { IoTicketOutline,IoTicket } from "react-icons/io5";
import { FaFileInvoiceDollar, FaRocketchat } from "react-icons/fa6";
import type { JSX } from 'react'
import { RiExchangeBoxFill } from "react-icons/ri";
import { PiHandDeposit } from "react-icons/pi";
import { PiHandWithdrawLight } from "react-icons/pi";
import { MdDashboardCustomize, MdWorkHistory } from "react-icons/md";


export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    dashboard: <MdDashboardCustomize />,
    exchange: <RiExchangeBoxFill />,
    inbox: <FaRocketchat />,
    deposit: <PiHandDeposit />,
    ticket:<IoTicketOutline />,
    Viewticket:<IoTicket />,
    invoice: <FaFileInvoiceDollar />,
    withdrawal: <PiHandWithdrawLight />,
    transaction: <MdWorkHistory />

}

export default navigationIcon
