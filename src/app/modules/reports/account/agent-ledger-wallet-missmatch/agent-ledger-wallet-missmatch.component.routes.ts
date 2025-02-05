import { Routes } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { AgentLedgerWalletMissmatchComponent } from "./agent-ledger-wallet-missmatch.component";

export default [
    {
        path: '',
        component: AgentLedgerWalletMissmatchComponent,
        canActivate: [AuthGuard],
        data: { module: 'BO Menu Links', group: 'Account', operation: 'Agent Ledger Wallet Missmatch', category: 'View' }
    },
] as Routes