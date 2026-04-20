import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function NewPatientsList({ patients }: { patients: any[] }) {
  return (
    <Card className="w-full border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          New Patients This Month 👤
        </CardTitle>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <p className="text-center py-10 text-slate-400">
            No new registrations yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {patients.map((p) => (
              <div
                key={p.$id}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all"
              >
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                    {p.firstname[0]}
                    {p.lastname[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-sm truncate">
                    {p.firstname} {p.lastname}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Joined {format(new Date(p.$createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
