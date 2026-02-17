# Finanzas - Gestor Personal con Expo + React Native

## Descripción

Creé este proyecto porque necesitaba una aplicación que se adaptara a mi manera de manejar las finanzas: quería abrir varias cuentas con porcentajes de distribución definidos y que al registrar un ingreso se pudieran repartir automáticamente según esos porcentajes. Como no encontré ninguna aplicación que tuviera una función similar, decidí desarrollarla yo mismo.

Aplicación móvil para administrar cuentas, ingresos, egresos y transferencias con persistencia local en SQLite. Diseñada para funcionar offline, ofrece una experiencia nativa pulida gracias a Expo Router, navegación con pestañas y componentes personalizados.

## Características Principales

1. **Gestión integral de cuentas:**
   - Crear, editar y eliminar cuentas con color, porcentaje de distribución y saldo inicial.
   - Eliminación segura con transferencia automática de registros y balances para evitar inconsistencias.
   - Botón flotante y modales dedicados con validaciones en tiempo real.
2. **Registro Unificado de Movimientos:**
   - Modal con tres pestañas (Ingreso, Gasto, Transferencia) comparte lógica y validación.
   - Distribución automática de ingresos según porcentajes configurados, incluyendo opción "Distribuir automáticamente".
   - Navegación mensual para filtrar registros y transferencias por mes/año.
3. **Transferencias Internas:**
   - Flujo con doble verificación de saldos, actualización atómica en DB y sincronización con el store.
   - Historial centralizado y cálculos de balances revertidos al eliminar/migrar cuentas.
4. **Persistencia Robusta:**
   - SQLite en todas las operaciones.
   - Transacciones con BEGIN, COMMIT y ROLLBACK para garantizar la integridad de los datos.
   - Función para recalcular los saldos desde cero usando la base de datos.
5. **Personalización:**
   - Selector de tema (claro/oscuro/automático) y paletas de color temático persistentes con AsyncStorage.
   - Exportación e importación desde Excel (.xlsx).
   - Pantalla de configuración.

## Arquitectura y Stack

- **Framework:** Expo + React Native con Expo Router.
- **Estado Global:** Zustand.
- **Base de Datos:** SQLite (expo-sqlite).
- **Validaciones:** Zod para formularios y reglas de negocio.
- **UI:** Componentes personalizados.
