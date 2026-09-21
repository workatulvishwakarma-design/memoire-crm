import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding MEMOIRE OS PostgreSQL database...");

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { id: "org-memoire" },
    update: {},
    create: {
      id: "org-memoire",
      name: "MEMOIRE",
      tagline: "CRAFTING BRANDS",
      officeLatitude: 19.0760,
      officeLongitude: 72.9982,
      officeRadiusMeters: 150,
    },
  });

  // 2. Roles
  const founderRole = await prisma.role.upsert({
    where: { name: "FOUNDER" },
    update: {},
    create: { name: "FOUNDER", description: "Agency Founder & Executive Director" },
  });

  // 3. User & Employee
  const founderUser = await prisma.user.upsert({
    where: { email: "rahul@memoire.co.in" },
    update: {},
    create: {
      email: "rahul@memoire.co.in",
      passwordHash: "$2a$10$e7K4k4a7o.s9R.Y3S5X3e.R1t1r1e1r1e1r1e1r1e1r1e1r1e1r1e",
      firstName: "Rahul",
      lastName: "Sharma",
      roleId: founderRole.id,
      organizationId: org.id,
      status: "ACTIVE",
    },
  });

  console.log(`Database seeded successfully for Organization: ${org.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
