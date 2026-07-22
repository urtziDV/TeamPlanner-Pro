"use client";

import { useState, useRef } from "react";
import { MessageSquare, Edit, Trash2, Plus, Save, Bold, Italic, List, ListOrdered, Palette } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfirm, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createTipoRecordatorio, deleteTipoRecordatorio, updateTipoRecordatorio } from "@/app/actions";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export function TemplatesManager({ initialTemplates = [] }: { initialTemplates?: any[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [open, setOpen] = useState(false);
  
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [plantilla, setPlantilla] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const variables = ["{Usuario}", "{Herramienta}", "{Fecha}", "{Fecha_Limite}", "{Dias_Retraso}"];

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = plantilla.substring(start, end);
    
    // For numbered lists, calculate next number if "1. " is passed
    let actualBefore = before;
    if (before === "\n1. ") {
      const lines = plantilla.substring(0, start).split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const match = lines[i].match(/^(\s*)(\d+)\.\s/);
        if (match) {
          actualBefore = `\n${match[1]}${parseInt(match[2], 10) + 1}. `;
          break;
        }
        if (lines[i].trim() !== "") break;
      }
    }

    const newText = plantilla.substring(0, start) + actualBefore + selectedText + after + plantilla.substring(end);
    setPlantilla(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + actualBefore.length, start + actualBefore.length + selectedText.length);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const beforeCursor = plantilla.substring(0, start);
      
      const lines = beforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];
      
      // Auto-increment numbered list
      const numMatch = currentLine.match(/^(\s*)(\d+)\.\s(.*)$/);
      if (numMatch) {
        e.preventDefault();
        const spaces = numMatch[1];
        const num = parseInt(numMatch[2], 10);
        const text = numMatch[3];
        
        if (text.trim() === "") {
          // Empty numbered line -> remove it and exit list
          const newText = plantilla.substring(0, start - currentLine.length) + plantilla.substring(textarea.selectionEnd);
          setPlantilla(newText);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - currentLine.length;
          }, 0);
          return;
        }

        const insert = `\n${spaces}${num + 1}. `;
        const newText = plantilla.substring(0, start) + insert + plantilla.substring(textarea.selectionEnd);
        setPlantilla(newText);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + insert.length;
        }, 0);
        return;
      }

      // Auto-continue bullet list
      const bulletMatch = currentLine.match(/^(\s*)([-*+]\s)(.*)$/);
      if (bulletMatch) {
        e.preventDefault();
        const spaces = bulletMatch[1];
        const bullet = bulletMatch[2];
        const text = bulletMatch[3];
        
        if (text.trim() === "") {
          // Empty bullet line -> remove it
          const newText = plantilla.substring(0, start - currentLine.length) + plantilla.substring(textarea.selectionEnd);
          setPlantilla(newText);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - currentLine.length;
          }, 0);
          return;
        }

        const insert = `\n${spaces}${bullet}`;
        const newText = plantilla.substring(0, start) + insert + plantilla.substring(textarea.selectionEnd);
        setPlantilla(newText);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + insert.length;
        }, 0);
        return;
      }
    }
  };

  const handleOpenNew = () => { 
    setEditingId(null); 
    setNombre(""); 
    setPlantilla("Hola **{Usuario}**,\n\nTienes pendiente devolver la herramienta: **{Herramienta}**.\n\nPor favor, devuélvela lo antes posible."); 
    setPreviewMode(false);
    setOpen(true); 
  };

  const handleOpenEdit = (t: any) => { 
    setEditingId(t.ID); 
    setNombre(t.Nombre); 
    setPlantilla(t.Plantilla); 
    setPreviewMode(false);
    setOpen(true); 
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !plantilla) return;
    
    try {
      if (editingId) {
        const updated = await updateTipoRecordatorio(editingId, { Nombre: nombre, Plantilla: plantilla });
        setTemplates(prev => prev.map(t => t.ID === editingId ? updated : t));
        toast.success("Plantilla actualizada");
      } else {
        const newTip = await createTipoRecordatorio({ Nombre: nombre, Plantilla: plantilla });
        setTemplates(prev => [...prev, newTip]);
        toast.success("Plantilla creada");
      }
      setOpen(false);
    } catch (err: any) {
      toast.error("Error al guardar: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ 
      title: "Eliminar Plantilla", 
      message: "¿Estás seguro de que quieres eliminar esta plantilla?", 
      variant: "destructive", 
      confirmLabel: "Eliminar" 
    });
    if (ok) { 
      try {
        await deleteTipoRecordatorio(id); 
        setTemplates(prev => prev.filter(t => t.ID !== id)); 
        toast.success("Plantilla eliminada");
      } catch (err: any) {
        toast.error("Error al eliminar: " + err.message);
      }
    }
  };

  const insertVariable = (variable: string) => {
    setPlantilla(prev => prev + variable);
  };

  // Generate preview text replacing variables with mock data
  const getPreviewText = () => {
    let text = plantilla;
    text = text.replace(/{Usuario}/g, "Juan Pérez");
    text = text.replace(/{Herramienta}/g, "Taladro Percutor Bosch");
    text = text.replace(/{Fecha}/g, new Date().toLocaleDateString());
    text = text.replace(/{Fecha_Limite}/g, new Date(Date.now() + 86400000).toLocaleDateString());
    text = text.replace(/{Dias_Retraso}/g, "2");
    return text;
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow md:col-span-2 xl:col-span-2">
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Plantillas de Envío</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los mensajes predefinidos para los recordatorios de email y WhatsApp. Soporta Markdown.
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button onClick={handleOpenNew} />}>
            <Plus className="h-4 w-4 mr-2" /> Nueva Plantilla
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl lg:max-w-5xl max-h-[95vh] h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Plantilla" : "Añadir Plantilla"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4 flex-1 overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre / Asunto</Label>
                <Input 
                  id="nombre"
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                  placeholder="Ej. Aviso de Retraso Urgente" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Contenido del Mensaje</Label>
                  <div className="flex gap-2 bg-muted p-1 rounded-md">
                    <button 
                      type="button" 
                      onClick={() => setPreviewMode(false)}
                      className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${!previewMode ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Editar Markdown
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setPreviewMode(true)}
                      className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${previewMode ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Vista Previa
                    </button>
                  </div>
                </div>

                {!previewMode ? (
                  <div className="space-y-2 flex flex-col h-full">
                    <div className="flex flex-wrap gap-1 bg-muted/50 p-1.5 rounded-md border">
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText("**", "**")} title="Negrita"><Bold className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText("*", "*")} title="Cursiva"><Italic className="h-4 w-4" /></Button>
                      <div className="w-px h-5 bg-border mx-1 self-center" />
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText("\n- ", "")} title="Lista con puntos"><List className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText("\n1. ", "")} title="Lista numerada"><ListOrdered className="h-4 w-4" /></Button>
                      <div className="w-px h-5 bg-border mx-1 self-center" />
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => insertText('<span style="color: #ef4444;">', '</span>')} title="Rojo"><Palette className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10" onClick={() => insertText('<span style="color: #3b82f6;">', '</span>')} title="Azul"><Palette className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => insertText('<span style="color: #22c55e;">', '</span>')} title="Verde"><Palette className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10" onClick={() => insertText('<span style="color: #f97316;">', '</span>')} title="Naranja"><Palette className="h-4 w-4" /></Button>
                    </div>
                    <Textarea 
                      ref={textareaRef}
                      value={plantilla} 
                      onChange={(e) => setPlantilla(e.target.value)} 
                      onKeyDown={handleKeyDown}
                      className="font-mono text-sm min-h-[450px] resize-none flex-1"
                      placeholder="Escribe el mensaje en formato Markdown..." 
                      required 
                    />
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="text-xs text-muted-foreground self-center mr-2">Insertar Variable:</span>
                      {variables.map(v => (
                        <button 
                          key={v} 
                          type="button" 
                          onClick={() => insertVariable(v)}
                          className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md hover:bg-secondary/80 transition-colors"
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-md p-4 min-h-[450px] overflow-y-auto bg-muted/20 prose dark:prose-invert prose-sm max-w-none flex-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {getPreviewText()}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar Plantilla</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="p-6">
        {templates.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-xl bg-card text-muted-foreground">
            No hay plantillas configuradas.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((t) => (
              <div key={t.ID} className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3 border-b pb-2">
                  <h4 className="font-semibold text-sm line-clamp-1">{t.Nombre}</h4>
                  <div className="flex items-center gap-1">
                    <Button title="Editar" variant="ghost" size="icon" onClick={() => handleOpenEdit(t)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button title="Eliminar" variant="ghost" size="icon" onClick={() => handleDelete(t.ID)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="prose dark:prose-invert prose-xs text-muted-foreground line-clamp-4 overflow-hidden text-xs bg-muted/20 p-2 rounded-md">
                   <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {t.Plantilla}
                    </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog confirmState={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
