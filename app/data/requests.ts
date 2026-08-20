import type { ServiceRequest } from '~/types/request'

const baseComments = [
  {
    id: 'comment-1',
    author: 'Анна Морозова',
    avatar: 'АМ',
    body: 'Проверяем конфигурацию и журналы сервиса. Вернусь с результатом в течение часа.',
    createdAt: 'Сегодня, 10:42',
  },
]

export const mockRequests: ServiceRequest[] = [
  ['REQ-1042', 'Не формируется отчёт по продажам за июль', 'in_progress', 'critical', 'Ирина Волкова', 'Northstar Retail', 'Анна Морозова', 'Отчётность'],
  ['REQ-1041', 'Настроить доступ новому сотруднику отдела', 'assigned', 'normal', 'Максим Орлов', 'Atlas Group', 'Денис Фролов', 'Доступы'],
  ['REQ-1040', 'Ошибка синхронизации остатков с CRM', 'waiting', 'high', 'Ольга Белова', 'Vektor', 'Анна Морозова', 'Интеграции'],
  ['REQ-1039', 'Изменить реквизиты организации в профиле', 'new', 'low', 'Павел Громов', 'Helix Labs', null, 'Аккаунт'],
  ['REQ-1038', 'Письма с уведомлениями попадают в спам', 'resolved', 'normal', 'Елена Лукина', 'Axiom', 'Сергей Ким', 'Уведомления'],
  ['REQ-1037', 'Недоступна выгрузка документов в PDF', 'escalated', 'critical', 'Артём Егоров', 'Northstar Retail', 'Денис Фролов', 'Документы'],
  ['REQ-1036', 'Добавить дополнительное поле в карточку', 'closed', 'low', 'Мария Соколова', 'Delta Soft', 'Сергей Ким', 'Настройки'],
  ['REQ-1035', 'Медленно открывается список контрагентов', 'in_progress', 'high', 'Иван Козлов', 'Logica', 'Анна Морозова', 'Производительность'],
  ['REQ-1034', 'Восстановить удалённый шаблон договора', 'assigned', 'normal', 'Наталья Романова', 'Axiom', 'Денис Фролов', 'Документы'],
  ['REQ-1033', 'Не обновляется номер телефона клиента', 'new', 'normal', 'Вадим Титов', 'Vektor', null, 'Аккаунт'],
  ['REQ-1032', 'Перенести историю обращений из архива', 'waiting', 'low', 'Софья Никитина', 'Atlas Group', 'Сергей Ким', 'Миграция'],
  ['REQ-1031', 'Критическая ошибка при входе через SSO', 'resolved', 'critical', 'Лев Захаров', 'Helix Labs', 'Анна Морозова', 'Доступы'],
].map(([id, title, status, priority, customer, company, assignee, category], index) => ({
  id: id!,
  title: title!,
  description: index === 0
    ? 'При попытке сформировать сводный отчёт за июль индикатор загрузки не исчезает. Ошибка воспроизводится у трёх пользователей финансового отдела.'
    : `Подробное описание обращения «${title}». Требуется диагностика и обратная связь по результату.`,
  status: status as ServiceRequest['status'],
  priority: priority as ServiceRequest['priority'],
  customer: customer!,
  customerCompany: company!,
  assignee: assignee ?? null,
  category: category!,
  createdAt: `2026-08-${String(18 - index).padStart(2, '0')}T09:20:00.000Z`,
  updatedAt: `2026-08-${String(19 - Math.min(index, 8)).padStart(2, '0')}T11:35:00.000Z`,
  slaDueAt: index % 3 === 0 ? 'Сегодня, 14:30' : index % 3 === 1 ? 'Завтра, 11:00' : '22 авг., 18:00',
  comments: index === 0 ? baseComments : [],
  timeline: [
    { id: `${id}-event-1`, title: 'Заявка создана', detail: `${customer}, ${company}`, createdAt: '18 авг., 09:20', kind: 'created' },
    { id: `${id}-event-2`, title: assignee ? 'Назначен исполнитель' : 'Ожидает назначения', detail: assignee ?? 'Очередь первой линии', createdAt: '18 авг., 09:34', kind: 'assignment' },
    ...(status === 'in_progress' ? [{ id: `${id}-event-3`, title: 'Работа начата', detail: 'Статус изменён исполнителем', createdAt: 'Сегодня, 10:14', kind: 'status' as const }] : []),
  ],
}))

export const statusLabels: Record<ServiceRequest['status'], string> = {
  new: 'Новая',
  assigned: 'Назначена',
  in_progress: 'В работе',
  waiting: 'Ожидание',
  resolved: 'Решена',
  closed: 'Закрыта',
  escalated: 'Эскалация',
}

export const priorityLabels: Record<ServiceRequest['priority'], string> = {
  critical: 'Критический',
  high: 'Высокий',
  normal: 'Обычный',
  low: 'Низкий',
}
