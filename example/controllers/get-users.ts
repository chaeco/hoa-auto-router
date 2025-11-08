import { HoaContext } from 'hoa'

export default async function (ctx: HoaContext) {
  ctx.res.body = {
    message: 'Hello from auto-router!',
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  }
}
