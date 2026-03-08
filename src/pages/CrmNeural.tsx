import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Download, Trash2, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, GitMerge } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  type Contact, fetchContacts, updateContact, deleteContacts, exportContactsCSV,
  getScoreColor, getScoreBg, STATUS_OPTIONS,
} from "@/lib/crm-service";
import { AddContactDialog } from "@/components/crm/AddContactDialog";
import { ContactDrawer } from "@/components/crm/ContactDrawer";
import { DeleteConfirmDialog } from "@/components/crm/DeleteConfirmDialog";

type SortField = "name" | "company" | "ai_score" | "status" | "last_contact_at";
type SortDir = "asc" | "desc";

const PAGE_SIZES = [10, 20, 50];

export default function CrmNeural() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("ai_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [drawerContact, setDrawerContact] = useState<Contact | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");

  const loadContacts = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchContacts(user.id);
      setContacts(data);
    } catch {
      toast.error("Eroare la încărcarea contactelor");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("contacts-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts", filter: `user_id=eq.${user.id}` }, () => {
        loadContacts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, loadContacts]);

  // Filter, sort, paginate
  const filtered = useMemo(() => {
    let result = contacts;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter((c) => c.status === statusFilter);
    result.sort((a, b) => {
      let valA: string | number = a[sortField] ?? "";
      let valB: string | number = b[sortField] ?? "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [contacts, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const newCount = contacts.filter((c) => c.is_new).length;

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 ml-1 text-primary" /> : <ArrowDown className="h-3 w-3 ml-1 text-primary" />;
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((c) => c.id)));
  };

  const handleDelete = async () => {
    try {
      await deleteContacts(Array.from(selected));
      toast.success(`${selected.size} contact(e) șterse`);
      setSelected(new Set());
      loadContacts();
    } catch {
      toast.error("Eroare la ștergere");
    }
    setDeleteOpen(false);
  };

  const handleInlineEdit = async (id: string, field: string) => {
    if (!editValue.trim()) { setEditingCell(null); return; }
    try {
      await updateContact(id, { [field]: field === "ai_score" ? parseInt(editValue) : editValue });
      loadContacts();
    } catch {
      toast.error("Eroare la actualizare");
    }
    setEditingCell(null);
  };

  const startEdit = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
  };

  const openDrawer = (contact: Contact) => {
    setDrawerContact(contact);
    setDrawerOpen(true);
    // Mark as seen
    if (contact.is_new) updateContact(contact.id, { is_new: false });
  };

  const statusBadgeVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (s) {
      case "customer": return "default";
      case "prospect": return "secondary";
      case "churned": return "destructive";
      default: return "outline";
    }
  };

  const sourceBadge = (s: string | null) => {
    const colors: Record<string, string> = {
      web: "bg-blue-500/10 text-blue-400",
      social: "bg-purple-500/10 text-purple-400",
      import: "bg-amber-500/10 text-amber-400",
      referral: "bg-emerald-500/10 text-emerald-400",
      manual: "bg-muted text-muted-foreground",
    };
    return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", colors[s || "manual"])}>{s || "manual"}</span>;
  };

  return (
    <>
      <PageHeader title="CRM Neural" description={`${contacts.length} contacte · ${newCount} noi`}>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast("Sync extern placeholder — configurează în Settings")} aria-label="Sync External CRM">
          <RefreshCw className="h-3.5 w-3.5" /> Sync
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast("Merge contacts — selectează 2+ contacte similare")} aria-label="Merge Contacts">
          <GitMerge className="h-3.5 w-3.5" /> Merge
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportContactsCSV(filtered)} aria-label="Export CSV">
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)} aria-label="Adaugă contact">
          <Plus className="h-3.5 w-3.5" /> Adaugă
        </Button>
      </PageHeader>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Caută contacte..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="h-9 pl-8 text-sm" aria-label="Caută contacte" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-36 h-9 text-xs" aria-label="Filtrează status"><SelectValue placeholder="Toate" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate statusurile</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {selected.size > 0 && (
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => setDeleteOpen(true)} aria-label="Șterge selecția">
            <Trash2 className="h-3.5 w-3.5" /> Șterge ({selected.size})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={paginated.length > 0 && selected.size === paginated.length} onCheckedChange={toggleAll} aria-label="Selectează toate" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>
                <span className="flex items-center">Nume <SortIcon field="name" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("company")}>
                <span className="flex items-center">Companie <SortIcon field="company" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none w-24" onClick={() => toggleSort("ai_score")}>
                <span className="flex items-center">AI Score <SortIcon field="ai_score" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("status")}>
                <span className="flex items-center">Status <SortIcon field="status" /></span>
              </TableHead>
              <TableHead>Sursă</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("last_contact_at")}>
                <span className="flex items-center">Ultim Contact <SortIcon field="last_contact_at" /></span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                  {search || statusFilter !== "all" ? "Niciun contact găsit." : "Niciun contact încă. Adaugă primul contact!"}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((c) => (
                <TableRow
                  key={c.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    c.is_new && "border-l-2 border-l-primary",
                    getScoreBg(c.ai_score)
                  )}
                  onClick={() => openDrawer(c)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} aria-label={`Selectează ${c.name}`} />
                  </TableCell>
                  <TableCell>
                    {editingCell?.id === c.id && editingCell.field === "name" ? (
                      <Input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleInlineEdit(c.id, "name")}
                        onKeyDown={(e) => e.key === "Enter" && handleInlineEdit(c.id, "name")}
                        className="h-7 text-sm"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Editează nume"
                      />
                    ) : (
                      <span
                        className="font-medium text-foreground hover:text-primary"
                        onDoubleClick={(e) => { e.stopPropagation(); startEdit(c.id, "name", c.name); }}
                      >
                        {c.name}
                        {c.is_new && <Badge className="ml-2 bg-primary/20 text-primary text-[9px] px-1">NOU</Badge>}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell?.id === c.id && editingCell.field === "company" ? (
                      <Input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleInlineEdit(c.id, "company")}
                        onKeyDown={(e) => e.key === "Enter" && handleInlineEdit(c.id, "company")}
                        className="h-7 text-sm"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Editează companie"
                      />
                    ) : (
                      <span
                        className="text-muted-foreground"
                        onDoubleClick={(e) => { e.stopPropagation(); startEdit(c.id, "company", c.company || ""); }}
                      >
                        {c.company || "—"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={cn("font-mono font-bold text-sm", getScoreColor(c.ai_score))}>
                      {c.ai_score}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(c.status)} className="text-[10px]">{c.status}</Badge>
                  </TableCell>
                  <TableCell>{sourceBadge(c.source)}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {c.last_contact_at ? new Date(c.last_contact_at).toLocaleDateString("ro-RO") : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Afișare {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} din {filtered.length}</span>
            <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(parseInt(v)); setPage(0); }}>
              <SelectTrigger className="h-7 w-20 text-xs" aria-label="Rânduri per pagină"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => <SelectItem key={s} value={s.toString()}>{s} / pag</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Pagina anterioară">Anterior</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Pagina următoare">Următor</Button>
          </div>
        </div>
      )}

      <AddContactDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={loadContacts} />
      <ContactDrawer contact={drawerContact} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} count={selected.size} onConfirm={handleDelete} />
    </>
  );
}
