import { HoaContext } from 'hoa'

export default async function (ctx: HoaContext) {
  const id = (ctx as any).params?.id
  ctx.res.body = {
    message: `User details for ID: ${id}`,
    user: { id, name: `User ${id}` },
  }
}
