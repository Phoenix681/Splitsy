import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Simple query to test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // Count existing users
    const userCount = await prisma.user.count();
    console.log(`📊 Current users in database: ${userCount}`);

    // Count existing groups
    const groupCount = await prisma.group.count();
    console.log(`📊 Current groups in database: ${groupCount}`);

    console.log('\n🎉 All systems operational!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();