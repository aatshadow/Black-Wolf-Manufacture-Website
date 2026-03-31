// Script to seed the complete ERP Manufacturing template
// Run with: npx tsx scripts/seed-erp-template.ts

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const schema = {
  template: {
    name: "ERP Manufacturing — Full Extraction",
    description: "Template completo para extraer todos los datos necesarios de un ERP de manufactura. Cubre 7 módulos funcionales: Finanzas, Cadena de Suministro, Producción, Ventas, Almacenes, Logística y Usuarios.",
    industry: "manufacturing"
  },
  tracks: [
    {
      name: "Producción & Operaciones",
      code: "track_production",
      description: "Extracción profunda del conocimiento de producción, cadena de suministro, almacenes y logística. Conversación abierta con expertos del área.",
      conversation_style: "open_ended",
      target_role: "domain_expert",
      bot_personality: "Soy KEA, tu asistente de descubrimiento. Estoy aquí para aprender todo sobre cómo produces, almacenas y distribuyes tus productos. Pregunto con curiosidad genuina y confirmo lo que entiendo antes de avanzar.",
      blocks: [
        // ═══════════════════════════════════════════════════
        // BLOQUE 3: GESTIÓN DE PRODUCCIÓN
        // ═══════════════════════════════════════════════════
        {
          name: "Tecnologías / BOM (Bill of Materials)",
          code: "bom",
          description: "Recetas de fabricación: qué materiales y en qué cantidades se necesitan para producir cada producto terminado.",
          is_repeatable: true,
          icon: "ClipboardList",
          fields: [
            { name: "Producto terminado", code: "finished_product", field_type: "text", description: "Nombre del producto que se fabrica", question_hint: "¿Qué producto se fabrica con esta receta?", is_required: true, is_bot_critical: true, group_label: "Identidad" },
            { name: "Código del producto", code: "product_code", field_type: "text", description: "Código interno o SKU del producto terminado", question_hint: "¿Tiene un código interno este producto?", is_required: true, is_bot_critical: false, group_label: "Identidad" },
            { name: "Versión de la receta", code: "bom_version", field_type: "text", description: "Versión o revisión del BOM", question_hint: "¿Manejan versiones de las recetas? ¿Cuál es la actual?", is_required: false, is_bot_critical: false, group_label: "Identidad" },
            { name: "Lista de materiales", code: "materials_list", field_type: "json", description: "Array de materiales con nombre, código, cantidad, unidad de medida", question_hint: "¿Qué materiales necesitas y en qué cantidades para fabricar una unidad?", is_required: true, is_bot_critical: true, group_label: "Materiales" },
            { name: "Unidad de medida del producto", code: "product_uom", field_type: "text", description: "Unidad en que se mide el producto terminado (piezas, kg, metros, etc.)", question_hint: "¿En qué unidad se mide el producto terminado?", is_required: true, is_bot_critical: false, group_label: "Materiales" },
            { name: "Rendimiento esperado", code: "expected_yield", field_type: "number", description: "Cantidad de producto terminado que se espera por lote", question_hint: "¿Cuántas unidades salen normalmente de un lote de producción?", is_required: false, is_bot_critical: false, group_label: "Materiales" },
            { name: "Porcentaje de merma esperado", code: "expected_scrap_pct", field_type: "number", description: "Porcentaje normal de desperdicio/merma", question_hint: "¿Qué porcentaje de desperdicio es normal en esta producción?", is_required: false, is_bot_critical: true, group_label: "Materiales" },
            { name: "Operaciones/Etapas de producción", code: "production_steps", field_type: "json", description: "Secuencia de operaciones para fabricar el producto", question_hint: "¿Cuáles son los pasos o etapas para fabricar este producto, en orden?", is_required: true, is_bot_critical: true, group_label: "Proceso" },
            { name: "Tiempo estándar por operación", code: "standard_times", field_type: "json", description: "Tiempos estándar de cada operación en minutos/horas", question_hint: "¿Cuánto tiempo toma cada operación normalmente?", is_required: false, is_bot_critical: false, group_label: "Proceso" },
            { name: "Máquinas requeridas", code: "machines_required", field_type: "multi_select", description: "Máquinas o equipos necesarios", question_hint: "¿Qué máquinas o equipos se usan en la fabricación?", is_required: false, is_bot_critical: false, group_label: "Proceso" },
            { name: "Materiales sustitutos", code: "substitute_materials", field_type: "json", description: "Materiales alternativos que pueden usarse", question_hint: "¿Hay materiales que puedan sustituirse si no hay stock del principal?", is_required: false, is_bot_critical: false, group_label: "Materiales" },
            { name: "Costo estimado de producción", code: "estimated_cost", field_type: "number", description: "Costo estimado de producir una unidad (себестойност)", question_hint: "¿Cuál es el costo aproximado de producir una unidad?", is_required: false, is_bot_critical: true, group_label: "Costos" },
            { name: "Método de cálculo de costos", code: "cost_method", field_type: "select", description: "Cómo se calcula el costo: promedio, FIFO, estándar, etc.", question_hint: "¿Cómo calculan el costo de producción? ¿Promedio ponderado, FIFO, costo estándar?", is_required: false, is_bot_critical: true, group_label: "Costos" },
            { name: "Notas", code: "bom_notes", field_type: "text", description: "Observaciones adicionales sobre la receta", question_hint: "¿Algo más que deba saber sobre esta receta de fabricación?", is_required: false, is_bot_critical: false, group_label: "General" }
          ]
        },
        {
          name: "Planificación de Producción",
          code: "production_planning",
          description: "Cómo se planifica la producción: planes, órdenes de trabajo, prioridades, capacidad.",
          is_repeatable: false,
          icon: "CalendarDays",
          fields: [
            { name: "Método de planificación", code: "planning_method", field_type: "select", description: "MTO (Make to Order), MTS (Make to Stock), mixto", question_hint: "¿Producen bajo pedido, para stock, o una mezcla de ambos?", is_required: true, is_bot_critical: true, group_label: "Estrategia" },
            { name: "Horizonte de planificación", code: "planning_horizon", field_type: "text", description: "Período típico de planificación (semanal, mensual, etc.)", question_hint: "¿Con cuánta antelación planifican la producción?", is_required: true, is_bot_critical: true, group_label: "Estrategia" },
            { name: "Quién planifica", code: "planner_role", field_type: "text", description: "Rol o persona responsable de la planificación", question_hint: "¿Quién es el responsable de planificar la producción?", is_required: false, is_bot_critical: false, group_label: "Estrategia" },
            { name: "Criterios de priorización", code: "priority_criteria", field_type: "text", description: "Cómo se priorizan las órdenes de producción", question_hint: "Cuando hay muchos pedidos, ¿cómo deciden qué producir primero?", is_required: false, is_bot_critical: true, group_label: "Estrategia" },
            { name: "Capacidad de producción diaria", code: "daily_capacity", field_type: "text", description: "Capacidad aproximada por día/turno", question_hint: "¿Cuánto pueden producir en un día normal?", is_required: false, is_bot_critical: false, group_label: "Capacidad" },
            { name: "Turnos de trabajo", code: "work_shifts", field_type: "text", description: "Número y horarios de turnos", question_hint: "¿Cuántos turnos trabajan y en qué horarios?", is_required: false, is_bot_critical: false, group_label: "Capacidad" },
            { name: "Cuellos de botella conocidos", code: "bottlenecks", field_type: "text", description: "Etapas o recursos que limitan la producción", question_hint: "¿Dónde están los cuellos de botella habituales en la producción?", is_required: false, is_bot_critical: true, group_label: "Capacidad" },
            { name: "Herramientas de planificación actuales", code: "current_tools", field_type: "text", description: "Software o métodos actuales de planificación", question_hint: "¿Qué herramientas usan hoy para planificar? ¿Excel, software, pizarra?", is_required: false, is_bot_critical: false, group_label: "Herramientas" },
            { name: "Gestión de cambios en plan", code: "plan_changes", field_type: "text", description: "Cómo manejan cambios urgentes o imprevistos", question_hint: "¿Qué pasa cuando llega un pedido urgente y hay que cambiar el plan?", is_required: false, is_bot_critical: false, group_label: "Herramientas" },
            { name: "Notas", code: "planning_notes", field_type: "text", question_hint: "¿Algo más sobre cómo planifican?", is_required: false, is_bot_critical: false, group_label: "General" }
          ]
        },
        {
          name: "Ejecución de Producción",
          code: "production_execution",
          description: "Cómo se ejecuta la producción: consumo de materiales, entrada de producto terminado, control, mermas, desmontajes.",
          is_repeatable: false,
          icon: "Factory",
          fields: [
            { name: "Proceso de inicio de orden", code: "order_start_process", field_type: "text", description: "Cómo se inicia una orden de producción", question_hint: "¿Cómo se abre una orden de producción? ¿Quién la autoriza?", is_required: true, is_bot_critical: true, group_label: "Flujo" },
            { name: "Registro de consumo de materiales", code: "material_consumption", field_type: "text", description: "Cómo se registra el consumo de materias primas", question_hint: "¿Cómo registran qué materiales se usaron en cada producción?", is_required: true, is_bot_critical: true, group_label: "Flujo" },
            { name: "Entrada de producto terminado", code: "finished_goods_entry", field_type: "text", description: "Proceso de ingreso del producto terminado al almacén", question_hint: "Cuando el producto está listo, ¿cómo entra al almacén?", is_required: true, is_bot_critical: true, group_label: "Flujo" },
            { name: "Control de calidad en producción", code: "quality_control", field_type: "text", description: "Puntos de control de calidad durante la producción", question_hint: "¿Hay controles de calidad durante la producción? ¿En qué etapas?", is_required: false, is_bot_critical: true, group_label: "Calidad" },
            { name: "Gestión de mermas/scrap", code: "scrap_management", field_type: "text", description: "Cómo se manejan los desperdicios y mermas", question_hint: "¿Cómo registran y gestionan la merma y el desperdicio?", is_required: false, is_bot_critical: true, group_label: "Calidad" },
            { name: "Desmontajes (reverse manufacturing)", code: "disassembly", field_type: "text", description: "Si desmontan productos para recuperar componentes", question_hint: "¿Alguna vez desmontan productos terminados para recuperar materiales? ¿Cómo funciona?", is_required: false, is_bot_critical: false, group_label: "Especial" },
            { name: "Cierre de planes no ejecutados", code: "plan_closure", field_type: "text", description: "Qué pasa con planes de producción que no se completan", question_hint: "¿Qué hacen cuando un plan de producción no se ejecuta o queda a medias?", is_required: false, is_bot_critical: false, group_label: "Especial" },
            { name: "Trazabilidad", code: "traceability", field_type: "text", description: "Nivel de trazabilidad: lote, serie, fecha", question_hint: "¿Pueden rastrear un producto terminado hasta los materiales que lo componen?", is_required: false, is_bot_critical: true, group_label: "Calidad" },
            { name: "Reportes de producción", code: "production_reports", field_type: "text", description: "Qué reportes generan sobre la producción", question_hint: "¿Qué informes o reportes sacan de la producción?", is_required: false, is_bot_critical: false, group_label: "Reportes" },
            { name: "Notas", code: "execution_notes", field_type: "text", question_hint: "¿Algo más sobre cómo ejecutan la producción?", is_required: false, is_bot_critical: false, group_label: "General" }
          ]
        },
        // ═══════════════════════════════════════════════════
        // BLOQUE 2: CADENA DE SUMINISTRO
        // ═══════════════════════════════════════════════════
        {
          name: "Cadena de Suministro",
          code: "supply_chain",
          description: "Proveedores, compras, entregas, lotes, garantías, números de serie.",
          is_repeatable: false,
          icon: "Truck",
          fields: [
            { name: "Proveedores principales", code: "main_suppliers", field_type: "json", description: "Lista de proveedores clave con materiales que suministran", question_hint: "¿Quiénes son sus proveedores principales y qué les suministran?", is_required: true, is_bot_critical: true, group_label: "Proveedores" },
            { name: "Proceso de compra", code: "purchase_process", field_type: "text", description: "Flujo desde la necesidad hasta la recepción del material", question_hint: "¿Cómo es el proceso de compra? Desde que detectan que falta material hasta que llega.", is_required: true, is_bot_critical: true, group_label: "Proveedores" },
            { name: "Lead time de proveedores", code: "supplier_lead_times", field_type: "text", description: "Tiempos típicos de entrega por proveedor/material", question_hint: "¿Cuánto tardan normalmente los proveedores en entregar?", is_required: false, is_bot_critical: true, group_label: "Proveedores" },
            { name: "Criterios de selección de proveedor", code: "supplier_criteria", field_type: "text", question_hint: "¿Qué criterios usan para elegir o evaluar proveedores?", is_required: false, is_bot_critical: false, group_label: "Proveedores" },
            { name: "Gestión de lotes", code: "lot_management", field_type: "text", description: "Si manejan lotes, cómo los identifican", question_hint: "¿Manejan control por lotes? ¿Cómo los identifican?", is_required: false, is_bot_critical: true, group_label: "Trazabilidad" },
            { name: "Control de garantías", code: "warranty_tracking", field_type: "text", description: "Fechas de garantía, vencimiento, caducidad", question_hint: "¿Registran fechas de garantía o caducidad de los materiales?", is_required: false, is_bot_critical: false, group_label: "Trazabilidad" },
            { name: "Números de serie", code: "serial_numbers", field_type: "text", description: "Si usan números de serie para productos o componentes", question_hint: "¿Usan números de serie para algún producto o componente?", is_required: false, is_bot_critical: false, group_label: "Trazabilidad" },
            { name: "Datos consolidados de entregas", code: "delivery_data", field_type: "text", description: "Cómo consolidan datos de entregas por artículo", question_hint: "¿Cómo consultan el historial de entregas de un artículo específico?", is_required: false, is_bot_critical: false, group_label: "Reportes" },
            { name: "Movimientos por período", code: "period_movements", field_type: "text", description: "Reportes de movimientos de materiales por período", question_hint: "¿Generan reportes de movimientos de materiales por período?", is_required: false, is_bot_critical: false, group_label: "Reportes" },
            { name: "Notas", code: "supply_notes", field_type: "text", question_hint: "¿Algo más sobre la cadena de suministro?", is_required: false, is_bot_critical: false, group_label: "General" }
          ]
        },
        // ═══════════════════════════════════════════════════
        // BLOQUE 5: GESTIÓN DE ALMACENES
        // ═══════════════════════════════════════════════════
        {
          name: "Gestión de Almacenes",
          code: "warehouse",
          description: "Nomenclaturas, operaciones de almacén, inventarios, transferencias, control de existencias, rotación.",
          is_repeatable: false,
          icon: "Warehouse",
          fields: [
            { name: "Almacenes existentes", code: "warehouses_list", field_type: "json", description: "Lista de almacenes con ubicación y tipo", question_hint: "¿Cuántos almacenes tienen y dónde están? ¿Qué guarda cada uno?", is_required: true, is_bot_critical: true, group_label: "Estructura" },
            { name: "Nomenclatura de artículos", code: "item_nomenclature", field_type: "text", description: "Cómo organizan y codifican los artículos", question_hint: "¿Cómo organizan los artículos? ¿Tienen grupos, categorías, códigos?", is_required: true, is_bot_critical: true, group_label: "Estructura" },
            { name: "Unidades de medida", code: "units_of_measure", field_type: "text", description: "Unidades usadas y si hay conversiones", question_hint: "¿Qué unidades de medida usan? ¿Hay conversiones entre ellas?", is_required: true, is_bot_critical: false, group_label: "Estructura" },
            { name: "Operaciones de entrada", code: "inbound_operations", field_type: "text", description: "Pedidos, recepciones, facturas de proveedor", question_hint: "¿Cómo es el proceso cuando llega mercancía? Pedido → recepción → factura.", is_required: true, is_bot_critical: true, group_label: "Operaciones" },
            { name: "Operaciones de salida", code: "outbound_operations", field_type: "text", description: "Despachos, entregas, facturas a cliente", question_hint: "¿Cómo es el proceso de salida de mercancía del almacén?", is_required: true, is_bot_critical: true, group_label: "Operaciones" },
            { name: "Devoluciones", code: "returns_process", field_type: "text", description: "Proceso de devoluciones de y a proveedor/cliente", question_hint: "¿Cómo manejan las devoluciones? Tanto de clientes como a proveedores.", is_required: false, is_bot_critical: false, group_label: "Operaciones" },
            { name: "Transferencias entre almacenes", code: "inter_warehouse_transfers", field_type: "text", description: "Cómo mueven material entre almacenes", question_hint: "¿Mueven material entre almacenes? ¿Cómo lo registran?", is_required: false, is_bot_critical: false, group_label: "Operaciones" },
            { name: "Inventarios/Revisiones", code: "inventory_process", field_type: "text", description: "Proceso y frecuencia de inventarios físicos", question_hint: "¿Cada cuánto hacen inventario físico? ¿Cómo es el proceso?", is_required: false, is_bot_critical: true, group_label: "Control" },
            { name: "Límites mín/máx de stock", code: "stock_limits", field_type: "text", description: "Si manejan niveles mínimos/máximos de inventario", question_hint: "¿Tienen definidos niveles mínimos y máximos de stock? ¿Para qué artículos?", is_required: false, is_bot_critical: true, group_label: "Control" },
            { name: "Método de valoración", code: "valuation_method", field_type: "select", description: "FIFO, LIFO, promedio ponderado, costo estándar", question_hint: "¿Cómo valoran el inventario? ¿FIFO, promedio ponderado, costo estándar?", is_required: false, is_bot_critical: true, group_label: "Control" },
            { name: "Reportes de rotación", code: "rotation_reports", field_type: "text", description: "Análisis de rotación de inventario", question_hint: "¿Analizan la rotación de inventario? ¿Qué reportes usan?", is_required: false, is_bot_critical: false, group_label: "Reportes" },
            { name: "Notas", code: "warehouse_notes", field_type: "text", question_hint: "¿Algo más sobre la gestión de almacenes?", is_required: false, is_bot_critical: false, group_label: "General" }
          ]
        },
        // ═══════════════════════════════════════════════════
        // BLOQUE 6: LOGÍSTICA
        // ═══════════════════════════════════════════════════
        {
          name: "Logística y Distribución",
          code: "logistics",
          description: "Planificación de pedidos, transporte, ejecución de entregas, organizer, notificaciones.",
          is_repeatable: false,
          icon: "MapPin",
          fields: [
            { name: "Proceso de pedido a entrega", code: "order_to_delivery", field_type: "text", description: "Flujo completo desde pedido del cliente hasta entrega", question_hint: "¿Cómo es el proceso desde que entra un pedido hasta que se entrega al cliente?", is_required: true, is_bot_critical: true, group_label: "Flujo" },
            { name: "Planificación de entregas", code: "delivery_planning", field_type: "text", description: "Cómo planifican las rutas y entregas", question_hint: "¿Cómo planifican las entregas? ¿Agrupan por zona, por día?", is_required: true, is_bot_critical: true, group_label: "Flujo" },
            { name: "Flota propia o tercerizada", code: "fleet_type", field_type: "select", description: "Si tienen transporte propio, subcontratado o mixto", question_hint: "¿Tienen transporte propio o subcontratan? ¿O ambos?", is_required: false, is_bot_critical: false, group_label: "Transporte" },
            { name: "Zonas de cobertura", code: "coverage_zones", field_type: "text", description: "Áreas geográficas que cubren", question_hint: "¿Qué zonas geográficas cubren con sus entregas?", is_required: false, is_bot_critical: false, group_label: "Transporte" },
            { name: "Seguimiento de pedidos", code: "order_tracking", field_type: "text", description: "Cómo rastrean el estado de los pedidos", question_hint: "¿Cómo saben en qué estado está cada pedido? ¿Hay algún sistema de seguimiento?", is_required: false, is_bot_critical: true, group_label: "Seguimiento" },
            { name: "Fechas de ejecución (Organizer)", code: "execution_dates", field_type: "text", description: "Cómo gestionan las fechas comprometidas", question_hint: "¿Cómo gestionan las fechas comprometidas de entrega? ¿Tienen algún organizador?", is_required: false, is_bot_critical: false, group_label: "Seguimiento" },
            { name: "Sistema de notificaciones", code: "notifications_system", field_type: "text", description: "Notificaciones transversales a todos los módulos", question_hint: "¿Tienen alertas o notificaciones automáticas? ¿Para qué eventos?", is_required: false, is_bot_critical: false, group_label: "Seguimiento" },
            { name: "Costos de envío", code: "shipping_costs", field_type: "text", description: "Cómo calculan y cobran el transporte", question_hint: "¿Cómo calculan los costos de envío? ¿Los cobran al cliente?", is_required: false, is_bot_critical: false, group_label: "Costos" },
            { name: "Problemas frecuentes", code: "logistics_issues", field_type: "text", description: "Problemas habituales en la logística", question_hint: "¿Cuáles son los problemas más frecuentes en la logística y entregas?", is_required: false, is_bot_critical: true, group_label: "Mejora" },
            { name: "Notas", code: "logistics_notes", field_type: "text", question_hint: "¿Algo más sobre logística?", is_required: false, is_bot_critical: false, group_label: "General" }
          ]
        }
      ]
    },
    {
      name: "Finanzas, Ventas & Administración",
      code: "track_admin",
      description: "Extracción estructurada de información financiera-contable, ventas/comercio, y gestión de usuarios/roles.",
      conversation_style: "guided",
      target_role: "manager",
      bot_personality: "Soy KEA, tu consultor de procesos administrativos. Trabajo de forma estructurada para entender cómo gestionan las finanzas, ventas y administración. Ofrezco opciones comunes para ahorrar tiempo.",
      blocks: [
        // ═══════════════════════════════════════════════════
        // BLOQUE 1: GESTIÓN FINANCIERO-CONTABLE (BALANCES)
        // ═══════════════════════════════════════════════════
        {
          name: "Gestión Financiero-Contable (Balances)",
          code: "finance",
          description: "Pagos, devoluciones, compensaciones, saldos, registros de ventas/compras, flujos de caja, nomenclatura de cuentas.",
          is_repeatable: false,
          icon: "Banknote",
          fields: [
            { name: "Plan de cuentas", code: "chart_of_accounts", field_type: "text", description: "Nomenclatura de cuentas contables que usan", question_hint: "¿Qué plan de cuentas usan? ¿Es estándar de su país o personalizado?", is_required: true, is_bot_critical: true, group_label: "Estructura contable" },
            { name: "Software contable actual", code: "accounting_software", field_type: "text", description: "Sistema contable que usan actualmente", question_hint: "¿Qué software contable usan hoy?", is_required: true, is_bot_critical: true, group_label: "Estructura contable" },
            { name: "Monedas", code: "currencies", field_type: "multi_select", description: "Monedas que manejan (BGN, EUR, USD, etc.)", question_hint: "¿En qué monedas operan? ¿Manejan tipo de cambio?", is_required: true, is_bot_critical: false, group_label: "Estructura contable" },
            { name: "Métodos de pago", code: "payment_methods", field_type: "multi_select", description: "Efectivo, transferencia, tarjeta, etc.", question_hint: "¿Qué métodos de pago aceptan y usan?", is_required: true, is_bot_critical: true, group_label: "Pagos" },
            { name: "Flujos de caja", code: "cash_flows", field_type: "text", description: "Cajas, bancos, tarjetas — cómo gestionan el efectivo", question_hint: "¿Cómo gestionan las cajas, cuentas bancarias y pagos con tarjeta?", is_required: true, is_bot_critical: true, group_label: "Pagos" },
            { name: "Proceso de pagos a proveedores", code: "supplier_payments", field_type: "text", description: "Flujo de aprobación y ejecución de pagos", question_hint: "¿Cómo es el proceso de pago a proveedores? ¿Quién aprueba?", is_required: true, is_bot_critical: true, group_label: "Pagos" },
            { name: "Cobros a clientes", code: "customer_collections", field_type: "text", description: "Proceso de cobro, plazos, seguimiento de morosos", question_hint: "¿Cómo cobran a clientes? ¿Qué plazos dan? ¿Cómo gestionan morosos?", is_required: true, is_bot_critical: true, group_label: "Pagos" },
            { name: "Compensaciones", code: "compensations", field_type: "text", description: "Si hacen compensación de deudas entre clientes/proveedores", question_hint: "¿Hacen compensaciones de deudas con proveedores o clientes?", is_required: false, is_bot_critical: false, group_label: "Pagos" },
            { name: "Registro de ventas", code: "sales_register", field_type: "text", description: "Cómo registran contablemente las ventas", question_hint: "¿Cómo registran las ventas contablemente?", is_required: false, is_bot_critical: false, group_label: "Registros" },
            { name: "Registro de compras", code: "purchase_register", field_type: "text", description: "Cómo registran contablemente las compras", question_hint: "¿Y las compras, cómo se registran?", is_required: false, is_bot_critical: false, group_label: "Registros" },
            { name: "IVA / Impuestos", code: "tax_handling", field_type: "text", description: "Tipos de IVA, retenciones, declaraciones", question_hint: "¿Qué tipos de IVA manejan? ¿Hacen retenciones? ¿Cada cuánto declaran?", is_required: true, is_bot_critical: true, group_label: "Impuestos" },
            { name: "Intercambio de datos contables", code: "accounting_integrations", field_type: "text", description: "Exportación/importación de datos con otros sistemas contables", question_hint: "¿Necesitan intercambiar datos con otro sistema contable? ¿En qué formato?", is_required: false, is_bot_critical: true, group_label: "Integración" },
            { name: "Reportes financieros clave", code: "financial_reports", field_type: "text", description: "Qué reportes financieros necesitan regularmente", question_hint: "¿Qué reportes financieros usan regularmente? Balance, P&L, flujo de caja, etc.", is_required: false, is_bot_critical: false, group_label: "Reportes" },
            { name: "Notas", code: "finance_notes", field_type: "text", question_hint: "¿Algo más sobre el área financiera?", is_required: false, is_bot_critical: false, group_label: "General" }
          ]
        },
        // ═══════════════════════════════════════════════════
        // BLOQUE 4: GESTIÓN DE VENTAS (COMERCIO)
        // ═══════════════════════════════════════════════════
        {
          name: "Gestión de Ventas (Comercio)",
          code: "sales",
          description: "Ofertas, reservaciones, ventas POS, devoluciones, facturación, reclamaciones, flujos de pago.",
          is_repeatable: false,
          icon: "ShoppingCart",
          fields: [
            { name: "Canales de venta", code: "sales_channels", field_type: "multi_select", description: "Tienda física, web, distribuidores, etc.", question_hint: "¿Por qué canales venden? ¿Tienda propia, online, distribuidores?", is_required: true, is_bot_critical: true, group_label: "Estructura" },
            { name: "Proceso de venta", code: "sales_process", field_type: "text", description: "Flujo desde contacto inicial hasta cierre", question_hint: "¿Cómo es el proceso de venta típico, desde el primer contacto hasta el cierre?", is_required: true, is_bot_critical: true, group_label: "Estructura" },
            { name: "Gestión de ofertas/cotizaciones", code: "quotations", field_type: "text", description: "Cómo crean y gestionan ofertas", question_hint: "¿Cómo preparan las ofertas o cotizaciones? ¿Quién las aprueba?", is_required: true, is_bot_critical: true, group_label: "Pre-venta" },
            { name: "Reservaciones", code: "reservations", field_type: "text", description: "Si manejan reservas de producto", question_hint: "¿Los clientes pueden reservar productos? ¿Cómo funciona?", is_required: false, is_bot_critical: false, group_label: "Pre-venta" },
            { name: "Listas de precios", code: "price_lists", field_type: "text", description: "Cómo manejan precios, descuentos, tarifas por cliente", question_hint: "¿Tienen listas de precios? ¿Descuentos por volumen, por cliente?", is_required: true, is_bot_critical: true, group_label: "Precios" },
            { name: "Ventas POS", code: "pos_sales", field_type: "text", description: "Si tienen punto de venta, cómo funciona", question_hint: "¿Tienen punto de venta (POS)? ¿Cómo funciona? ¿Qué equipo usan?", is_required: false, is_bot_critical: false, group_label: "POS" },
            { name: "Facturación", code: "invoicing", field_type: "text", description: "Proceso de facturación: facturas, notas de crédito/débito", question_hint: "¿Cómo es el proceso de facturación? ¿Emiten notas de crédito/débito?", is_required: true, is_bot_critical: true, group_label: "Facturación" },
            { name: "Numeración de documentos", code: "document_numbering", field_type: "text", description: "Cómo numeran facturas, notas, etc.", question_hint: "¿Cómo numeran las facturas y otros documentos? ¿Series, prefijos?", is_required: false, is_bot_critical: false, group_label: "Facturación" },
            { name: "Devoluciones de clientes", code: "customer_returns", field_type: "text", description: "Proceso de devolución y reembolso", question_hint: "¿Cómo manejan las devoluciones de clientes?", is_required: false, is_bot_critical: true, group_label: "Post-venta" },
            { name: "Reclamaciones", code: "complaints", field_type: "text", description: "Cómo gestionan quejas y reclamaciones", question_hint: "¿Tienen un proceso para gestionar reclamaciones o quejas?", is_required: false, is_bot_critical: false, group_label: "Post-venta" },
            { name: "Seguimiento de pagos", code: "payment_tracking", field_type: "text", description: "Cómo rastrean pagos pendientes y vencidos", question_hint: "¿Cómo hacen seguimiento de los pagos pendientes y vencidos?", is_required: false, is_bot_critical: true, group_label: "Pagos" },
            { name: "CRM / Gestión de clientes", code: "crm", field_type: "text", description: "Si tienen CRM o base de datos de clientes", question_hint: "¿Tienen un CRM o base de datos de clientes? ¿Qué datos guardan?", is_required: false, is_bot_critical: false, group_label: "Clientes" },
            { name: "Notas", code: "sales_notes", field_type: "text", question_hint: "¿Algo más sobre ventas?", is_required: false, is_bot_critical: false, group_label: "General" }
          ]
        },
        // ═══════════════════════════════════════════════════
        // BLOQUE 7: GESTIÓN DE USUARIOS Y ROLES
        // ═══════════════════════════════════════════════════
        {
          name: "Usuarios, Roles y Permisos",
          code: "users_roles",
          description: "Administración de usuarios, roles, permisos por módulo, control de acceso.",
          is_repeatable: false,
          icon: "Users",
          fields: [
            { name: "Roles existentes", code: "roles_list", field_type: "json", description: "Lista de roles con descripción (vendedor, contador, admin, etc.)", question_hint: "¿Qué roles de usuario necesitan? Por ejemplo: vendedor, contador, jefe de producción, administrador...", is_required: true, is_bot_critical: true, group_label: "Roles" },
            { name: "Permisos por módulo", code: "module_permissions", field_type: "json", description: "Qué puede hacer cada rol en cada módulo", question_hint: "¿Qué debería poder hacer cada rol? Por ejemplo, ¿un vendedor puede ver costos de producción?", is_required: true, is_bot_critical: true, group_label: "Roles" },
            { name: "Cantidad de usuarios", code: "user_count", field_type: "number", description: "Número total de usuarios que usarán el sistema", question_hint: "¿Cuántas personas usarán el sistema?", is_required: true, is_bot_critical: false, group_label: "Usuarios" },
            { name: "Estructura organizativa", code: "org_structure", field_type: "text", description: "Departamentos, jerarquía, quién reporta a quién", question_hint: "¿Cómo está organizada la empresa? ¿Departamentos, jerarquía?", is_required: false, is_bot_critical: true, group_label: "Usuarios" },
            { name: "Autenticación", code: "auth_method", field_type: "text", description: "Cómo se autentican los usuarios (contraseña, SSO, etc.)", question_hint: "¿Cómo quieren que los usuarios inicien sesión? ¿Contraseña simple, doble factor?", is_required: false, is_bot_critical: false, group_label: "Seguridad" },
            { name: "Restricciones de datos", code: "data_restrictions", field_type: "text", description: "Si hay datos que solo ciertos roles pueden ver", question_hint: "¿Hay información que solo ciertos roles deberían poder ver? ¿Precios de costo, salarios?", is_required: false, is_bot_critical: true, group_label: "Seguridad" },
            { name: "Auditoría", code: "audit_requirements", field_type: "text", description: "Necesidades de log de actividad, quién hizo qué", question_hint: "¿Necesitan registrar quién hizo qué en el sistema? ¿Nivel de detalle?", is_required: false, is_bot_critical: false, group_label: "Seguridad" },
            { name: "Notas", code: "users_notes", field_type: "text", question_hint: "¿Algo más sobre usuarios y permisos?", is_required: false, is_bot_critical: false, group_label: "General" }
          ]
        }
      ]
    }
  ]
};

async function seedTemplate() {
  // Read org and user from env or use the first org
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  // Get first organization
  const orgRes = await fetch(`${SUPABASE_URL}/rest/v1/organizations?limit=1`, { headers });
  const orgs = await orgRes.json();
  if (!orgs.length) { console.error('No organizations found'); process.exit(1); }
  const org = orgs[0];

  // Get first user
  const userRes = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?organization_id=eq.${org.id}&limit=1`, { headers });
  const users = await userRes.json();
  const userId = users[0]?.id || null;

  console.log(`Organization: ${org.name} (${org.id})`);
  console.log(`User: ${userId}`);

  // Call the schemas API
  const response = await fetch('http://localhost:3000/api/kea/schemas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      schema,
      organizationId: org.id,
      userId,
    }),
  });

  const result = await response.json();
  console.log('Result:', JSON.stringify(result, null, 2));
}

seedTemplate().catch(console.error);
