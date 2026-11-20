import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Calculator, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react"

export default async function CortesCajaPage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  const cortes = await prisma.corteCaja.findMany({
    include: {
      cajero: {
        select: { nombre: true, correo: true },
      },
      _count: {
        select: { ventas: true },
      },
    },
    orderBy: { fechaApertura: "desc" },
  })

  const cortesCerrados = cortes.filter((c) => c.estado === "cerrado")
  const totalDiferencia = cortesCerrados.reduce(
    (acc, c) => acc + Number(c.diferencia ?? 0),
    0
  )
  const cortesConFaltante = cortesCerrados.filter(
    (c) => Number(c.diferencia ?? 0) < -0.01
  ).length
  const turnosAbiertos = cortes.filter((c) => c.estado === "abierto").length

  const formatMoney = (val: unknown) => {
    if (val === null || val === undefined) return "—"
    return `$${Number(val).toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cortes de Caja</h1>
        <p className="text-sm text-muted-foreground">
          Auditoría de turnos y arqueos ciegos realizados por los cajeros
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{cortes.length}</p>
            <p className="text-xs text-muted-foreground">Total de turnos</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{turnosAbiertos}</p>
            <p className="text-xs text-muted-foreground">Turnos abiertos ahora</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{cortesConFaltante}</p>
            <p className="text-xs text-muted-foreground">Cortes con faltante</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p
              className={`text-2xl font-bold ${
                totalDiferencia < 0
                  ? "text-red-600 dark:text-red-400"
                  : totalDiferencia > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-foreground"
              }`}
            >
              {totalDiferencia >= 0 ? `+$${totalDiferencia.toFixed(2)}` : `-$${Math.abs(totalDiferencia).toFixed(2)}`}
            </p>
            <p className="text-xs text-muted-foreground">Balance neto diferencias</p>
          </div>
        </div>
      </div>

      {/* Tabla de Cortes */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Historial de Cortes Ciegos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Cajero</th>
                <th className="py-3 px-4">Apertura / Cierre</th>
                <th className="py-3 px-4 text-right">Fondo Inicial</th>
                <th className="py-3 px-4 text-right">Ventas</th>
                <th className="py-3 px-4 text-right">Esperado</th>
                <th className="py-3 px-4 text-right">Declarado</th>
                <th className="py-3 px-4 text-right">Diferencia</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cortes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted-foreground">
                    Aún no hay cortes de caja registrados.
                  </td>
                </tr>
              ) : (
                cortes.map((corte) => {
                  const dif = corte.diferencia !== null ? Number(corte.diferencia) : null
                  return (
                    <tr key={corte.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-primary">
                        #{String(corte.id).padStart(4, "0")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">{corte.cajero.nombre}</div>
                        <div className="text-xs text-muted-foreground">{corte.cajero.correo}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        <div>
                          Abierto:{" "}
                          {new Date(corte.fechaApertura).toLocaleString("es-MX", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </div>
                        {corte.fechaCierre && (
                          <div>
                            Cerrado:{" "}
                            {new Date(corte.fechaCierre).toLocaleString("es-MX", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">{formatMoney(corte.fondoInicial)}</td>
                      <td className="py-3 px-4 text-right">
                        {formatMoney(corte.ventasTotales)}
                        <span className="block text-xs text-muted-foreground">
                          ({corte._count.ventas} ventas)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatMoney(corte.efectivoEsperado)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatMoney(corte.efectivoReal)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {dif === null ? (
                          "—"
                        ) : Math.abs(dif) < 0.01 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">$0.00</span>
                        ) : dif < 0 ? (
                          <span className="text-red-600 dark:text-red-400">
                            -${Math.abs(dif).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">
                            +${dif.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            corte.estado === "abierto"
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {corte.estado === "abierto" ? "Abierto" : "Cerrado"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground max-w-[200px] truncate">
                        {corte.observaciones || "—"}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}