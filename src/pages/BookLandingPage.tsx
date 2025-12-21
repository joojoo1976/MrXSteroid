"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MadeWithDyad } from "@/components/made-with-dyad";
import CountdownTimer from "@/components/CountdownTimer"; // Import the new CountdownTimer component
import { getTranslation, Language } from "@/lib/i18n";

const BookLandingPage = () => {
  const [lang, setLang] = useState<Language>("ar");
  const t = getTranslation(lang);

  const handleLanguageChange = (value: string) => {
    setLang(value as Language);
  };

  // Set the end date for the offer (7 days from now for demonstration)
  const offerEndDate = new Date();
  offerEndDate.setDate(offerEndDate.getDate() + 7);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white ${lang === 'ar' ? 'font-arabic text-right' : 'font-sans text-left'}`}>
      {/* Language Selector */}
      <div className="flex justify-end p-4">
        <Select onValueChange={handleLanguageChange} defaultValue={lang}>
          <SelectTrigger className="w-[180px] bg-gray-700 text-white border-gray-600">
            <SelectValue placeholder={t.language} />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white border-gray-700">
            <SelectItem value="ar">{t.arabic}</SelectItem>
            <SelectItem value="en">{t.english}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          {t.bookTitle}
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          {t.tagline}
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
          <img
            src="/مستر_إكس_سترويد_Mr_X_Steroid_غلاف_النسخة_العربية_امامى0 (02).png" // Updated to use the provided book cover image
            alt={t.bookTitle}
            className="w-64 h-auto rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
          />
          <div className={`max-w-md ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <h2 className="text-3xl font-bold mb-4 text-blue-300">{t.aboutTheBook}</h2>
            <p className="text-lg text-gray-200 leading-relaxed mb-6">
              {t.aboutDescription}
            </p>
            <a href="#purchase-options">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300">
                {t.buyNow}
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Separator className="bg-gray-700 my-12 container mx-auto" />

      {/* Special Offer Section */}
      <section className="container mx-auto px-4 py-12 text-center bg-gray-800 rounded-lg shadow-2xl border border-purple-600">
        <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">
          {t.specialOfferTitle}
        </h2>
        <p className="text-xl text-gray-200 mb-4 max-w-3xl mx-auto">
          {t.offerDescription}
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
          <p className="text-2xl text-gray-400 line-through">{t.oldPrice}</p>
          <p className="text-4xl font-extrabold text-yellow-400">{t.newPrice}</p>
        </div>
        <p className="text-lg text-red-400 mb-4">{t.offerEnds}</p>
        <CountdownTimer endDate={offerEndDate} lang={lang} />
        <div className="mt-8">
          <a href="#purchase-options">
            <Button className="bg-red-600 hover:bg-red-700 text-white text-xl px-10 py-4 rounded-full shadow-lg transition-all duration-300 animate-pulse">
              {t.orderNow}
            </Button>
          </a>
        </div>
      </section>

      <Separator className="bg-gray-700 my-12 container mx-auto" />

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-10 text-blue-300">
          {t.benefitsTitle}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[t.benefit1, t.benefit2, t.benefit3, t.benefit4, t.benefit5, t.benefit6].map((benefit, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 text-white shadow-xl">
              <CardContent className="p-6">
                <p className="text-gray-300 leading-relaxed">
                  {benefit}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="bg-gray-700 my-12 container mx-auto" />

      {/* Glimpse Inside Section (Excerpts) */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-10 text-blue-300">
          {t.glimpseInside}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-gray-800 border-gray-700 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-purple-400">
                {lang === 'ar' ? "مقتطف 1" : "Excerpt 1"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed italic">
                "{t.excerpt1}"
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-purple-400">
                {lang === 'ar' ? "مقتطف 2" : "Excerpt 2"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed italic">
                "{t.excerpt2}"
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="bg-gray-700 my-12 container mx-auto" />

      {/* Valuable Tables Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-10 text-blue-300">
          {t.valuableTables}
        </h2>
        <p className="text-lg text-gray-300 text-center mb-8 max-w-3xl mx-auto">
          {t.tableDescription}
        </p>
        <Card className="bg-gray-800 border-gray-700 text-white shadow-xl">
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-700 hover:bg-gray-700">
                  <TableHead className="text-purple-300">{lang === 'ar' ? "المعيار" : "Parameter"}</TableHead>
                  <TableHead className="text-purple-300">{lang === 'ar' ? "القيمة الدنيا" : "Min Value"}</TableHead>
                  <TableHead className="text-purple-300">{lang === 'ar' ? "القيمة القصوى" : "Max Value"}</TableHead>
                  <TableHead className="text-purple-300">{lang === 'ar' ? "الوحدة" : "Unit"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-gray-700 hover:bg-gray-700/50">
                  <TableCell className="font-medium text-gray-200">{lang === 'ar' ? "المؤشر أ" : "Indicator A"}</TableCell>
                  <TableCell className="text-gray-300">10</TableCell>
                  <TableCell className="text-gray-300">50</TableCell>
                  <TableCell className="text-gray-300">{lang === 'ar' ? "وحدة" : "Unit"}</TableCell>
                </TableRow>
                <TableRow className="border-gray-700 hover:bg-gray-700/50">
                  <TableCell className="font-medium text-gray-200">{lang === 'ar' ? "المؤشر ب" : "Indicator B"}</TableCell>
                  <TableCell className="text-gray-300">5</TableCell>
                  <TableCell className="text-gray-300">25</TableCell>
                  <TableCell className="text-gray-300">{lang === 'ar' ? "ملغ" : "mg"}</TableCell>
                </TableRow>
                <TableRow className="border-gray-700 hover:bg-gray-700/50">
                  <TableCell className="font-medium text-gray-200">{lang === 'ar' ? "المؤشر ج" : "Indicator C"}</TableCell>
                  <TableCell className="text-gray-300">100</TableCell>
                  <TableCell className="text-gray-300">200</TableCell>
                  <TableCell className="text-gray-300">{lang === 'ar' ? "جرام" : "grams"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Separator className="bg-gray-700 my-12 container mx-auto" />

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-10 text-blue-300">
          {t.whatReadersSay}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-gray-800 border-gray-700 text-white shadow-xl">
            <CardContent className="p-6">
              <p className="text-gray-300 italic mb-4">
                {t.testimonial1}
              </p>
              <p className={`font-semibold text-purple-400 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                - {t.testimonialAuthor1}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700 text-white shadow-xl">
            <CardContent className="p-6">
              <p className="text-gray-300 italic mb-4">
                {t.testimonial2}
              </p>
              <p className={`font-semibold text-purple-400 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                - {t.testimonialAuthor2}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="bg-gray-700 my-12 container mx-auto" />

      {/* Final Call to Action / Purchase Options */}
      <section id="purchase-options" className="container mx-auto px-4 py-12 text-center bg-gray-800 rounded-lg shadow-2xl border border-blue-600">
        <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          {t.getYourCopyNow}
        </h2>
        <p className="text-2xl font-semibold text-gray-200 mb-8">{t.availableOptions}</p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Arabic Version */}
          <Card className="bg-gray-700 border-blue-500 text-white shadow-xl p-6 flex flex-col justify-between">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-blue-300 mb-2">{t.arabicVersion}</CardTitle>
              <CardDescription className="text-lg text-gray-300">{t.arabicPrice}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <a href={t.facebookLink} target="_blank" rel="noopener noreferrer">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 w-full">
                  {t.orderArabicVersion}
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* English Version */}
          <Card className="bg-gray-700 border-purple-500 text-white shadow-xl p-6 flex flex-col justify-between">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-purple-300 mb-2">{t.englishVersion}</CardTitle>
              <CardDescription className="text-lg text-gray-300">{t.englishPrice}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <a href={t.luluLink} target="_blank" rel="noopener noreferrer">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 w-full">
                  {t.viewEnglishVersion}
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <MadeWithDyad />
    </div>
  );
};

export default BookLandingPage;