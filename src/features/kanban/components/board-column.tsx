'use client';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KanbanColumn, KanbanColumnHandle } from '@/components/ui/kanban';
import type { Task } from '../utils/store';
import { TaskCard } from './task-card';
import { useT, translateMaybe } from '@/i18n/use-t';

interface TaskColumnProps extends Omit<React.ComponentProps<typeof KanbanColumn>, 'children'> {
  tasks: Task[];
}

export function TaskColumn({ value, tasks, ...props }: TaskColumnProps) {
  const t = useT();
  return (
    <KanbanColumn value={value} className='w-full shrink-0 md:w-[320px]' {...props}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-semibold'>
            {translateMaybe('kanban.columns.' + value, t)}
          </span>
          <Badge variant='secondary' className='pointer-events-none rounded-sm'>
            {tasks.length}
          </Badge>
        </div>
        <KanbanColumnHandle render={<Button variant='ghost' size='icon' />}>
          <Icons.gripVertical className='h-4 w-4' />
        </KanbanColumnHandle>
      </div>
      <div className='flex flex-col gap-2 p-0.5'>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} asHandle />
        ))}
      </div>
    </KanbanColumn>
  );
}
