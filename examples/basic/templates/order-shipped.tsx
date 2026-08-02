import { Body, Template, variable, type Vars } from 'react-whatsapp-templates'

interface Props {
  firstName: string
  orderId: string
}

export default function OrderShipped({ firstName, orderId }: Vars<Props>) {
  // A variable used more than once is declared once and reused.
  const order = variable(orderId, { name: 'order_id', example: '860198-230332' })

  return (
    <Template name="order_shipped" language="en_US" category="UTILITY">
      <Body>
        Hi {variable(firstName, { name: 'first_name', example: 'Pablo' })}, your order {order} has
        shipped. Track it with the reference {order}.
      </Body>
    </Template>
  )
}
