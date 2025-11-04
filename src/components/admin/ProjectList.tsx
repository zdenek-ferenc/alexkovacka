'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Trash2, Eye, EyeOff } from 'lucide-react';
import { Project, deleteProject, toggleProjectVisibility, updateProjectOrder } from '../../../src/app/[lang]/admin/projects/actions';
import { useFormStatus } from 'react-dom';

function VisibilityToggle({ project }: { project: Project }) {
  const [isPublished, setIsPublished] = useState(project.is_published);
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={async () => {
        setIsPublished(!isPublished);
        await toggleProjectVisibility(project.id, project.is_published);
      }}
      className={`p-2 rounded-md ${isPublished ? 'text-green-500 cursor-pointer ease-in-out duration-200 hover:bg-green-100' : 'text-gray-400 cursor-pointer hover:bg-gray-100'} disabled:opacity-50`}
      aria-label={isPublished ? "Skrýt projekt" : "Zveřejnit projekt"}
    >
      {isPublished ? <Eye size={20} /> : <EyeOff size={20} />}
    </button>
  );
}


export default function ProjectList({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;

    const newProjects = Array.from(projects);
    const [reorderedItem] = newProjects.splice(source.index, 1);
    newProjects.splice(destination.index, 0, reorderedItem);

    setProjects(newProjects);
    updateProjectOrder(newProjects);
  };

  return (
    <div className="overflow-x-auto">
      <DragDropContext onDragEnd={handleDragEnd}>
        <table className="w-full text-left table-fixed"> 
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-4 w-12"></th>
              <th className="p-4">Název</th>
              <th className="p-4">Slug (URL)</th>
              <th className="p-4 w-24 text-center">Stav</th>
              <th className="p-4 w-24 text-right">Akce</th>
            </tr>
          </thead>
          <Droppable droppableId="projects">
            {(provided) => (
              <tbody ref={provided.innerRef} {...provided.droppableProps}>
                {projects.map((project, index) => (
                  <Draggable key={project.id} draggableId={project.id.toString()} index={index}>
                    {(provided) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border-b hover:bg-gray-50"
                      >
                        <td 
                          className="p-4 text-gray-400 cursor-grab w-12"
                          {...provided.dragHandleProps}
                        >
                          <GripVertical size={20} />
                        </td>
                        <td className="p-4 font-medium">
                          <a href={`/admin/projects/${project.id}`} className="block">
                            {project.name}
                          </a>
                        </td>
                        <td className="p-4 text-gray-500">
                          <a href={`/admin/projects/${project.id}`} className="block">
                            /{project.slug}
                          </a>
                        </td>
                        <td className="p-4 text-center w-24">
                          <form> 
                            <VisibilityToggle project={project} />
                          </form>
                        </td>
                        <td className="p-4 text-right w-24">
                          <form action={async () => {
                            if (confirm(`Opravdu smazat projekt "${project.name}"?`)) {
                              setProjects(projects.filter(p => p.id !== project.id));
                              await deleteProject(project.id);
                            }
                          }}>
                            <button type="submit" className="text-red-500 cursor-pointer ease-in-out duration-200 hover:text-red-700 p-2 rounded-md">
                              <Trash2 size={20} />
                            </button>
                          </form>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </table>
      </DragDropContext>
      {projects.length === 0 && <p className="text-gray-500 mt-4 p-4">Zatím tu nejsou žádné projekty.</p>}
    </div>
  );
}