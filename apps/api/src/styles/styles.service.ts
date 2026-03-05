import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, prisma } from '@picoria/db';

@Injectable()
export class StylesService {
  async listPublished(lang: 'en' | 'ru') {
    const items = await prisma.style.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' }
    });

    return items.map((style) => ({
      id: style.id,
      slug: style.slug,
      title: lang === 'ru' ? style.titleRu : style.titleEn,
      description: lang === 'ru' ? style.descriptionRu : style.descriptionEn,
      sampleImages: style.sampleImages
    }));
  }

  async getBySlug(slug: string, lang: 'en' | 'ru') {
    const style = await prisma.style.findUnique({ where: { slug } });
    if (!style || !style.isPublished) {
      throw new NotFoundException('Style not found');
    }

    return {
      id: style.id,
      slug: style.slug,
      title: lang === 'ru' ? style.titleRu : style.titleEn,
      description: lang === 'ru' ? style.descriptionRu : style.descriptionEn,
      faq: lang === 'ru' ? style.faqRu : style.faqEn,
      sampleImages: style.sampleImages,
      defaultParams: style.defaultParams
    };
  }

  async adminList() {
    return prisma.style.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async adminCreate(data: {
    slug: string;
    titleEn: string;
    titleRu: string;
    descriptionEn: string;
    descriptionRu: string;
    faqEn: Prisma.InputJsonValue;
    faqRu: Prisma.InputJsonValue;
    sampleImages: Prisma.InputJsonValue;
    promptTemplate: Prisma.InputJsonValue;
    defaultParams: Prisma.InputJsonValue;
    isPublished: boolean;
  }) {
    return prisma.style.create({ data });
  }

  async adminUpdate(id: string, data: Record<string, unknown>) {
    return prisma.style.update({ where: { id }, data: data as Prisma.StyleUpdateInput });
  }

  async adminDelete(id: string) {
    return prisma.style.delete({ where: { id } });
  }
}
