"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { processPayroll } from "./actions";

export function PayrollSimulationCard({ payrollId, status }: { payrollId: string, status: string }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (confirm("Integrar os lançamentos contratuais de planos de saúde desta competência? A operação valida histórico funcional, rubricas e eventos canônicos e preserva os itens existentes.")) {
      setIsProcessing(true);
      const result = await processPayroll(payrollId);
      setIsProcessing(false);
      
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  return (
    <Card size="sm" className="mt-1 rounded-md border-blue-200 shadow-none dark:border-blue-900">
      <CardHeader className="border-b bg-blue-50/50 pb-2">
        <CardTitle className="text-blue-800 flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Integração de origens contratuais
        </CardTitle>
        <CardDescription>
          Poste mensalidades, despesas e devoluções de planos com configuração de produção aprovada. Os valores vêm do ledger contratual; salário e outros benefícios exigem suas próprias origens canônicas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-3 pt-3">
        {status === "Fechada" || status === "Paga" ? (
          <div className="flex flex-col items-center justify-center p-4 text-emerald-700 bg-emerald-50 rounded-lg w-full">
            <CheckCircle2 className="h-8 w-8 mb-2" />
            <p className="font-semibold">Folha já processada e consolidada.</p>
            <p className="text-sm">Correções de origens financeiras exigem lançamentos compensatórios em competência aberta.</p>
          </div>
        ) : (
          <Button 
            size="lg" 
            className="w-full max-w-sm" 
            onClick={handleProcess}
            disabled={isProcessing}
          >
            {isProcessing ? "Integrando origens..." : "Postar origens de planos"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
