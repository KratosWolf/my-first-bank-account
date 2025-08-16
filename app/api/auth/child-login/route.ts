import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/config';
import { children, parents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const childLoginSchema = z.object({
  pin: z.string().length(4, 'PIN deve ter 4 dígitos'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = childLoginSchema.parse(body);

    // Find child by PIN
    // Note: In a real app, you'd want to hash PINs for security
    const childData = await db
      .select({
        child: children,
        parent: {
          id: parents.id,
          familyName: parents.familyName,
        },
      })
      .from(children)
      .leftJoin(parents, eq(children.parentId, parents.id))
      .where(eq(children.pin, pin))
      .limit(1);

    if (childData.length === 0) {
      return NextResponse.json(
        { error: 'PIN incorreto' },
        { status: 401 }
      );
    }

    const { child, parent } = childData[0];

    if (!child.isActive) {
      return NextResponse.json(
        { error: 'Conta desativada' },
        { status: 403 }
      );
    }

    // Return child data (without sensitive information)
    const childResponse = {
      id: child.id,
      name: child.name,
      avatar: child.avatar,
      balance: child.balance,
      level: child.level,
      points: child.points,
      familyName: parent?.familyName,
    };

    return NextResponse.json({ child: childResponse });
  } catch (error) {
    console.error('Child login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}