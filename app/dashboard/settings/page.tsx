import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BranchManagementTab } from "@/app/dashboard/settings/components/BranchManagementTab";
import { DentistManagementTab } from "@/app/dashboard/settings/components/DentistManagementTab";
import { ServiceManagementTab } from "@/app/dashboard/settings/components/ServiceManagementTab";
import { UserManagementTab } from "@/app/dashboard/settings/components/UserManagementTab";
import BranchHoursManager from "./components/BranchHoursManager";
import { ExpenseCategoryTab } from "./components/ExpenseCategoryTab";
import { ServiceCategoryTab } from "./components/ServiceCategoryTab";
import {
  Users,
  MapPin,
  Stethoscope,
  Syringe,
  Tag,
  Clock,
  Receipt,
  Layers,
  Wallet, // Added Wallet icon for the commissions tab
} from "lucide-react";
import { InventoryCategoryTab } from "./components/InventoryCategoryTab";
import { DentistCommissionTab } from "./components/DentistCommissionTab"; // Added import

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 bg-slate-50/30 min-h-screen">
      {/* --- Header Section --- */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          🛠️ System Configuration
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Fine-tune your clinic's operations, manage access controls, and
          customize your service catalog.
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full space-y-8">
        {/* --- Modern Styled Tabs List --- */}
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="inline-flex h-auto w-full justify-start gap-1 rounded-none border-b border-slate-200 bg-transparent p-0">
            <TabTriggerItem
              value="users"
              icon={<Users className="size-4" />}
              label="Users & Roles"
            />
            <TabTriggerItem
              value="branches"
              icon={<MapPin className="size-4" />}
              label="Branches"
            />
            <TabTriggerItem
              value="dentists"
              icon={<Stethoscope className="size-4" />}
              label="Dentists"
            />
            {/* <TabTriggerItem
              value="services"
              icon={<Syringe className="size-4" />}
              label="Services"
            /> */}
            <TabTriggerItem
              value="serviceCategories"
              icon={<Tag className="size-4" />}
              label="Service Categories"
            />
            <TabTriggerItem
              value="clinichours"
              icon={<Clock className="size-4" />}
              label="Clinic Hours"
            />
            <TabTriggerItem
              value="expenses"
              icon={<Receipt className="size-4" />}
              label="Expenses Categories"
            />
            <TabTriggerItem
              value="inventoryCategories"
              icon={<Layers className="size-4" />}
              label="Inventory Categories"
            />
            {/* Added Dentist Commissions Tab Trigger */}
            <TabTriggerItem
              value="commissions"
              icon={<Wallet className="size-4" />}
              label="Dentist Commissions"
            />
          </TabsList>
        </div>

        {/* --- Tab Content Wrapper --- */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <TabsContent
            value="users"
            className="m-0 border-none p-0 outline-none"
          >
            <UserManagementTab />
          </TabsContent>

          <TabsContent
            value="branches"
            className="m-0 border-none p-0 outline-none"
          >
            <BranchManagementTab />
          </TabsContent>

          <TabsContent
            value="dentists"
            className="m-0 border-none p-0 outline-none"
          >
            <DentistManagementTab />
          </TabsContent>

          <TabsContent
            value="services"
            className="m-0 border-none p-0 outline-none"
          >
            <ServiceManagementTab />
          </TabsContent>

          <TabsContent
            value="serviceCategories"
            className="m-0 border-none p-0 outline-none"
          >
            <ServiceCategoryTab />
          </TabsContent>

          <TabsContent
            value="clinichours"
            className="m-0 border-none p-0 outline-none"
          >
            <BranchHoursManager />
          </TabsContent>

          <TabsContent
            value="expenses"
            className="m-0 border-none p-0 outline-none"
          >
            <ExpenseCategoryTab />
          </TabsContent>

          <TabsContent
            value="inventoryCategories"
            className="m-0 border-none p-0 outline-none"
          >
            <InventoryCategoryTab />
          </TabsContent>

          {/* Added Dentist Commissions Tab Content */}
          <TabsContent
            value="commissions"
            className="m-0 border-none p-0 outline-none"
          >
            <DentistCommissionTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

/**
 * Reusable Trigger Component for cleaner code
 */
function TabTriggerItem({
  value,
  icon,
  label,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className="relative flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:text-blue-600 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none whitespace-nowrap"
    >
      {icon}
      {label}
    </TabsTrigger>
  );
}
