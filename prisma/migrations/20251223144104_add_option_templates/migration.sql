-- CreateTable
CREATE TABLE "option_template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "option_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_value_template" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "option_value_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "option_template_name_key" ON "option_template"("name");

-- AddForeignKey
ALTER TABLE "option_value_template" ADD CONSTRAINT "option_value_template_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "option_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
