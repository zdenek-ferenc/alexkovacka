'use client';

import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Trash2, Eye, EyeOff, Folder, FolderOpen, ArrowLeft, CornerDownRight, ArrowUpFromLine } from 'lucide-react';
import { Project, deleteProject, toggleProjectVisibility, updateProjectOrder, assignProjectToCollection } from '../../../src/app/[lang]/admin/projects/actions';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';

function VisibilityToggle({ project }: { project: Project }) {
  const { pending } = useFormStatus();
  const isPublished = project.is_published;

  return (
    <button
      type="submit"
      disabled={pending}
      className={`p-2 rounded-full ${isPublished ? 'text-green-500 cursor-pointer hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'} transition-colors duration-200`}
      onClick={(e) => e.stopPropagation()}
    >
      {isPublished ? <Eye className="cursor-pointer" size={20} /> : <EyeOff className="cursor-pointer" size={20} />}
    </button>
  );
}

export default function ProjectList({ initialProjects, collections = [] }: { initialProjects: Project[], collections?: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const visibleProjects = useMemo(() => {
    return projects.filter(p => p.parent_id === currentFolderId).sort((a, b) => a.order_index - b.order_index);
  }, [projects, currentFolderId]);

  const currentFolder = projects.find(p => p.id === currentFolderId);

  // Funkce pro vytažení projektu z kolekce zpět do Rootu
  const handleMoveToRoot = async (projectId: number) => {
    // Optimistický update
    const newProjects = projects.map(p =>
      p.id === projectId ? { ...p, parent_id: null } : p
    );
    setProjects(newProjects);

    try {
      await assignProjectToCollection(projectId, null);
      router.refresh();
    } catch (error) {
      console.error("Chyba při přesunu:", error);
      setProjects(projects); // Revert
      alert("Nepodařilo se přesunout projekt.");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, combine, draggableId } = result;

    // 1. Vložení do složky (jen v Rootu)
    if (combine) {
      const draggedProjectId = parseInt(draggableId);
      const targetCollectionId = parseInt(combine.draggableId);
      const targetProject = projects.find(p => p.id === targetCollectionId);

      if (targetProject && targetProject.is_collection) {
        const newProjects = projects.map(p =>
          p.id === draggedProjectId ? { ...p, parent_id: targetCollectionId } : p
        );
        setProjects(newProjects);

        try {
          await assignProjectToCollection(draggedProjectId, targetCollectionId);
          router.refresh();
        } catch (error) {
          console.error(error);
          setProjects(projects);
          alert("Chyba při přesunu.");
        }
      }
      return;
    }

    // 2. Změna pořadí
    if (!destination) return;
    if (destination.index === source.index && destination.droppableId === source.droppableId) return;

    const reorderedList = Array.from(visibleProjects);
    const [movedItem] = reorderedList.splice(source.index, 1);
    reorderedList.splice(destination.index, 0, movedItem);

    const updatedVisibleProjects = reorderedList.map((p, index) => ({
      ...p,
      order_index: index
    }));

    const newGlobalProjects = projects.map(p => {
      const updated = updatedVisibleProjects.find(up => up.id === p.id);
      return updated ? updated : p;
    });

    setProjects(newGlobalProjects);
    await updateProjectOrder(updatedVisibleProjects);
  };

  return (
    <div className="flex flex-col space-y-4 pb-24">

      {/* Navigace (Breadcrumbs) */}
      <div className="flex items-center space-x-2 text-sm mb-2 h-10">
        <button
          onClick={() => setCurrentFolderId(null)}
          className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${currentFolderId === null ? 'bg-black text-white font-bold' : 'bg-gray-200 cursor-pointer text-gray-700 hover:bg-gray-300'}`}
        >
          Hlavní přehled
        </button>

        {currentFolder && (
          <>
            <span className="text-gray-400">/</span>
            <div className="flex items-center space-x-2 bg-black text-white px-3 py-1.5 rounded-md">
              <FolderOpen size={16} />
              <span className="font-bold">{currentFolder.name}</span>
            </div>
            <button
              onClick={() => setCurrentFolderId(null)}
              className="ml-4 flex items-center text-gray-500 cursor-pointer hover:text-black transition-all ease-in-out duration-200 text-xs"
            >
              <ArrowLeft size={14} className="mr-1" /> Zpět
            </button>
          </>
        )}
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <DragDropContext onDragEnd={handleDragEnd}>
          <table className="w-full text-left table-fixed min-w-[600px]">
            <thead className="border-b bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <tr>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4 w-[40%]">Název</th>
                <th className="p-4 w-[20%]">URL (Slug)</th>
                <th className="p-4 w-24 text-center">Viditelnost</th>
                <th className="p-4 w-32 text-right">Akce</th>
              </tr>
            </thead>

            <Droppable droppableId="projects-list" isCombineEnabled={currentFolderId === null}>
              {(provided) => (
                <tbody ref={provided.innerRef} {...provided.droppableProps} className="divide-y divide-gray-100">
                  {visibleProjects.length > 0 ? (
                    visibleProjects.map((project, index) => (
                      <Draggable key={project.id} draggableId={project.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            onClick={() => {
                              if (project.is_collection) {
                                setCurrentFolderId(project.id);
                              } else {
                                router.push(`/admin/projects/${project.id}`);
                              }
                            }}
                            className={`
                                transition-colors duration-200 group cursor-pointer
                                ${snapshot.isDragging ? 'bg-blue-50 shadow-lg' : 'hover:bg-gray-50'}
                                ${project.is_collection ? 'bg-amber-50/30 hover:bg-amber-50' : 'bg-white'}
                                ${snapshot.combineTargetFor ? 'bg-blue-100 border-2 border-blue-500' : ''} 
                              `}
                            style={provided.draggableProps.style}
                          >
                            <td
                              className="p-4 text-gray-400 cursor-grab active:cursor-grabbing w-12 text-center"
                              {...provided.dragHandleProps}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GripVertical size={20} />
                            </td>
                            <td className="p-4 font-medium truncate">
                              <div className="flex items-center gap-3">
                                {project.is_collection ? (
                                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                    <Folder size={20} />
                                  </div>
                                ) : (
                                  currentFolderId !== null ? <CornerDownRight size={16} className="text-gray-300 ml-1" /> : null
                                )}

                                <div className="flex flex-col">
                                  <span className={`text-base ${project.is_collection ? 'font-bold text-gray-800' : 'text-gray-700'}`}>
                                    {project.name}
                                  </span>
                                  {project.is_collection && (
                                    <span className="text-xs text-amber-600 font-medium mt-0.5">
                                      Kolekce
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-gray-500 truncate font-mono text-sm">
                              /{project.slug}
                            </td>

                            <td className="p-4 text-center">
                              <form action={toggleProjectVisibility.bind(null, project.id, project.is_published)}>
                                <VisibilityToggle project={project} />
                              </form>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">

                                {currentFolderId !== null && !project.is_collection && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm("Přesunout zpět do hlavního seznamu?")) {
                                        handleMoveToRoot(project.id);
                                      }
                                    }}
                                    className="p-2 text-blue-400 cursor-pointer hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="Vyjmout z kolekce"
                                  >
                                    <ArrowUpFromLine className="cursor-pointer" size={20} />
                                  </button>
                                )}

                                <form onSubmit={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  const confirmMessage = project.is_collection
                                    ? `Opravdu smazat KOLEKCI "${project.name}"?\nPOZOR: Musí být prázdná, aby šla smazat!`
                                    : `Opravdu smazat projekt "${project.name}"?`;

                                  if (confirm(confirmMessage)) {
                                    const originalProjects = projects;
                                    setProjects(projects.filter(p => p.id !== project.id));
                                    try {
                                      await deleteProject(project.id);
                                    } catch (error) {
                                      console.error(error);
                                      alert('Chyba: ' + (error as Error).message);
                                      setProjects(originalProjects);
                                    }
                                  }
                                }}>
                                  <button type="submit" className="text-red-400 cursor-pointer hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors" onClick={(e) => e.stopPropagation()}>
                                    <Trash2 className="cursor-pointer" size={20} />
                                  </button>
                                </form>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                        {currentFolderId
                          ? "Tato kolekce je prázdná."
                          : "Žádné projekty."}
                      </td>
                    </tr>
                  )}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>
        </DragDropContext>
      </div>

      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="font-semibold mb-1">Nápověda k ovládání:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Kliknutím na Projekt</strong> (v seznamu nebo v kolekci) otevřeš jeho úpravy.</li>
          <li><strong>Kliknutím na Kolekci</strong> (žlutá ikona) ji otevřeš.</li>
          <li><strong>Přesun do kolekce:</strong> V hlavním přehledu chyť projekt a pusť ho na složku.</li>
          <li><strong>Vytažení z kolekce:</strong> Uvnitř složky klikni na modrou šipku <ArrowUpFromLine size={14} className="inline" /> vpravo.</li>
        </ul>
      </div>
    </div>
  );
}