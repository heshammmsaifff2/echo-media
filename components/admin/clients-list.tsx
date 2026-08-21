"use client";

import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Client = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
};

export function ClientsList({ clients }: { clients: Client[] }) {
  const { isAr } = useI18n();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {isAr ? "العملاء" : "Clients"}
      </h1>

      {!clients?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isAr ? "لم يسجل أي عميل بعد" : "No clients have signed up yet."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => (
            <Card key={client.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{client.full_name || (isAr ? "بدون اسم" : "No name")}</p>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {client.role === "client" ? (isAr ? "عميل" : "client") : client.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(client.created_at).toLocaleDateString(isAr ? "ar-EG" : "en-US")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
