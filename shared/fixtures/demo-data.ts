import type { CategorySummary, CustomerSummary, ServiceRequest, UserSummary } from '../types/domain'

export const demoUsers: UserSummary[] = [
  { id: 'user-client', name: 'Ирина Волкова', email: 'client@workflow.local', role: 'client', status: 'active', customerId: 'customer-northstar' },
  { id: 'user-operator', name: 'Анна Морозова', email: 'operator@workflow.local', role: 'operator', status: 'active', customerId: null },
  { id: 'user-agent-1', name: 'Денис Фролов', email: 'agent@workflow.local', role: 'agent', status: 'active', customerId: null },
  { id: 'user-agent-2', name: 'Сергей Ким', email: 'sergey@workflow.local', role: 'agent', status: 'active', customerId: null },
  { id: 'user-admin', name: 'Алексей Власов', email: 'admin@workflow.local', role: 'admin', status: 'active', customerId: null },
  { id: 'user-inactive', name: 'Роман Юдин', email: 'inactive@workflow.local', role: 'agent', status: 'inactive', customerId: null },
]

export const demoCustomers: CustomerSummary[] = [
  ['customer-northstar', 'Ирина Волкова', 'irina@northstar.local', '+7 495 100-20-30', 'Northstar Retail'],
  ['customer-atlas', 'Максим Орлов', 'maxim@atlas.local', '+7 495 200-40-50', 'Atlas Group'],
  ['customer-vektor', 'Ольга Белова', 'olga@vektor.local', '+7 812 300-10-20', 'Vektor'],
  ['customer-helix', 'Павел Громов', 'pavel@helix.local', '+7 343 400-30-20', 'Helix Labs'],
  ['customer-axiom', 'Елена Лукина', 'elena@axiom.local', '+7 383 500-40-10', 'Axiom'],
  ['customer-delta', 'Мария Соколова', 'maria@delta.local', '+7 395 600-70-80', 'Delta Soft'],
  ['customer-logica', 'Иван Козлов', 'ivan@logica.local', '+7 391 700-90-10', 'Logica'],
].map(([id, name, email, phone, company]) => ({ id: id!, name: name!, email: email!, phone: phone!, company: company!, createdAt: '2026-01-15T08:00:00.000Z' }))

export const demoCategories: CategorySummary[] = [
  ['category-reports', 'Отчётность', 'Отчёты и аналитические выгрузки'],
  ['category-access', 'Доступы', 'Учётные записи, роли и SSO'],
  ['category-integration', 'Интеграции', 'Обмен данными со сторонними системами'],
  ['category-account', 'Аккаунт', 'Профили пользователей и компаний'],
  ['category-documents', 'Документы', 'Шаблоны и печатные формы'],
  ['category-settings', 'Настройки', 'Изменение конфигурации продукта'],
].map(([id, name, description]) => ({ id: id!, name: name!, description: description!, isActive: true }))

const requestSource = [
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
] as const

function findCustomerId(company: string) {
  return demoCustomers.find(customer => customer.company === company)?.id ?? 'customer-northstar'
}

function findCategoryId(category: string) {
  return demoCategories.find(item => item.name === category)?.id ?? 'category-settings'
}

function findAssigneeId(name: string | null) {
  return demoUsers.find(user => user.name === name)?.id ?? null
}

export const demoRequests: ServiceRequest[] = requestSource.map(([id, title, status, priority, customer, company, assignee, category], index) => ({
  id,
  title,
  description: index === 0
    ? 'При попытке сформировать сводный отчёт за июль индикатор загрузки не исчезает. Ошибка воспроизводится у трёх пользователей финансового отдела.'
    : `Подробное описание обращения «${title}». Требуется диагностика и обратная связь по результату.`,
  status,
  priority,
  customerId: findCustomerId(company),
  customer,
  customerCompany: company,
  assigneeId: findAssigneeId(assignee),
  assignee,
  categoryId: findCategoryId(category),
  category,
  createdAt: `2026-08-${String(18 - index).padStart(2, '0')}T09:20:00.000Z`,
  updatedAt: `2026-08-${String(19 - Math.min(index, 8)).padStart(2, '0')}T11:35:00.000Z`,
  slaDueAt: `2026-08-${String(20 + index % 3).padStart(2, '0')}T${index % 3 === 0 ? '14:30' : '18:00'}:00.000Z`,
  closedAt: status === 'closed' ? '2026-08-19T12:00:00.000Z' : null,
  archived: false,
  version: 1,
  comments: index === 0 ? [{ id: 'comment-1', requestId: id, authorId: 'user-operator', author: 'Анна Морозова', avatar: 'АМ', body: 'Проверяем конфигурацию и журналы сервиса. Вернусь с результатом в течение часа.', createdAt: '2026-08-20T10:42:00.000Z' }] : [],
  timeline: [
    { id: `${id}-event-1`, title: 'Заявка создана', detail: `${customer}, ${company}`, createdAt: '2026-08-18T09:20:00.000Z', kind: 'created' },
    { id: `${id}-event-2`, title: assignee ? 'Назначен исполнитель' : 'Ожидает назначения', detail: assignee ?? 'Очередь первой линии', createdAt: '2026-08-18T09:34:00.000Z', kind: 'assignment' },
    ...(status === 'in_progress' ? [{ id: `${id}-event-3`, title: 'Работа начата', detail: 'Статус изменён исполнителем', createdAt: '2026-08-20T10:14:00.000Z', kind: 'status' as const }] : []),
  ],
}))
