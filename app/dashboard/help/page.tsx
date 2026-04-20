import {
  IconBook,
  IconQuestionMark,
  IconLayoutDashboard,
  IconCalendarEvent,
  IconUsers,
  IconReportMoney,
  IconSettings,
  IconToolsKitchen,
} from "@tabler/icons-react";

// Mock component for an Accordion/Disclosure (You'd replace this with your actual component)
const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => (
  <div className="border-b border-gray-100 py-4 last:border-0">
    <h3 className="text-base md:text-lg font-semibold text-slate-800 flex items-start">
      <IconQuestionMark className="shrink-0 size-5 mr-3 mt-0.5 text-indigo-500" />
      {question}
    </h3>
    <p className="mt-2 pl-8 text-sm md:text-base text-slate-600 leading-relaxed">
      {answer}
    </p>
  </div>
);

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I switch between different clinic branches?",
      answer:
        "At the top left of the sidebar, under the clinic logo, there is a branch selector dropdown. Click it to switch your current view and manage records for a specific branch.",
    },
    {
      question: "How do I approve or decline an appointment?",
      answer:
        "Go to the 'Appointments' tab. Pending appointments will be highlighted in yellow. Click the 'Approve' (check) or 'Decline' (X) buttons next to the appointment, or open the details view to change the status.",
    },
    {
      question: "How do I add a new Patient Record?",
      answer:
        "Navigate to the 'Patient Records' link in the sidebar. Click the 'Add New Record' button, fill out the required personal identity and contact details, and click 'Save'.",
    },
    {
      question: "How do I update a patient's Dental Chart?",
      answer:
        "Open a specific Patient Record and navigate to the 'Dental Chart' section. You can click on individual teeth to mark surface conditions, missing teeth, impactions, or restorations. Don't forget to save your changes.",
    },
    {
      question: "Where can I manage clinic expenses?",
      answer:
        "Click on the 'Expenses' tab in the sidebar. Here you can log daily operational costs, utility bills, and inventory purchases. This data automatically feeds into your Sales Reports.",
    },
    {
      question: "Where can I view Sales Reports?",
      answer:
        "The 'Sales Reports' tab in the main sidebar menu contains all financial summaries. You can filter reports by date range, branch, or individual dentist performance.",
    },
    {
      question: "How do I update my profile settings or password?",
      answer:
        "Click your user avatar or name at the bottom of the sidebar. Select 'Account Settings' to change your personal information, email address, or update your password.",
    },
  ];

  const guides = [
    {
      icon: <IconLayoutDashboard className="size-6 text-indigo-600" />,
      title: "Dashboard Overview",
      description:
        "Your central hub. View real-time analytics on daily sales, patient flow, and quick KPIs to track the clinic's overall daily performance at a glance.",
    },
    {
      icon: <IconCalendarEvent className="size-6 text-emerald-600" />,
      title: "Appointments Manager",
      description:
        "Monitor and manage your daily and monthly schedule. Filter by focus dates, view patient care details, and approve or decline pending online bookings.",
    },
    {
      icon: <IconUsers className="size-6 text-blue-600" />,
      title: "Patient Records",
      description:
        "A complete database of your patients. Access personal biodata, emergency contacts, medical history, clinical remarks, and track their financial ledgers.",
    },
    {
      icon: <IconToolsKitchen className="size-6 text-cyan-600" />,
      title: "Clinical Details",
      description:
        "Within each patient's record, manage specific clinical data including interactive dental charting, specific surface notes, and uploaded consent forms.",
    },
    {
      icon: <IconReportMoney className="size-6 text-amber-600" />,
      title: "Inventory & Finance",
      description:
        "Track your stock levels in the Inventory tab, log outgoings in Expenses, and view comprehensive financial health in the Sales Reports section.",
    },
    {
      icon: <IconSettings className="size-6 text-slate-600" />,
      title: "System Settings",
      description:
        "For administrators: Manage clinic services, inventory categories, user permissions, and branch settings to customize the app to your workflow.",
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-9xl mx-auto space-y-10">
      {/* --- Header Section --- */}
      <header className="bg-linear-to-r from-indigo-50 to-white border border-indigo-100 rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
          <IconBook className="size-10 text-indigo-600" />
          System Instructions & Help
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-3xl">
          Welcome to the Egargue Dental Group management system guide. Find
          comprehensive instructions, workflow breakdowns, and answers to common
          questions below.
        </p>
      </header>

      {/* --- Main Guide Section --- */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Comprehensive System Guide
          </h2>
          <p className="text-slate-500 mt-1">
            Understanding the core modules of your clinic management system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-slate-100">
                {guide.icon}
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">
                {guide.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {guide.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- FAQ Section --- */}
      <section className="pb-10">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 mt-1">
            Quick answers to the most common actions and workflows.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 md:p-6">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>
    </div>
  );
}
