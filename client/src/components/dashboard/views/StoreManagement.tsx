import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const products = [
    {
        id: 1,
        name: "DA VOICE - Tshirt",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dNoYXJ0fGVufDB8fDB8fHww",
        description: "Organic Cotton...",
        price: "€49.99",
        stock: "In Stock",
        size: "S,M,X,2X",
    },
    {
        id: 2,
        name: "Lil Baby - Tshirt",
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dNoYXJ0fGVufDB8fDB8fHww",
        description: "Organic Cotton...",
        price: "€49.99",
        stock: "Out of Stock",
        size: "S,M,X,2X",
    },
    {
        id: 3,
        name: "DARKO - White Cap",
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FwfGVufDB8fDB8fHww",
        description: "Organic Cotton...",
        price: "€49.99",
        stock: "In Stock",
        size: "S,M,X,2X",
    },
    {
        id: 4,
        name: "Exmilitary - Tshirt",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
        description: "Organic Cotton...",
        price: "€49.99",
        stock: "In Stock",
        size: "S,M,X,2X",
    },
];

export function StoreManagement() {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Upload Cards */}
                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle>Upload Album in library</CardTitle>
                        <CardDescription>
                            Upload or create tracks to add them to your library for use in upcoming projects.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-slate-100 p-3">
                            <Music className="h-6 w-6 text-slate-500" />
                        </div>
                        <p className="text-sm text-center text-muted-foreground">Upload newly composed songs to your library.</p>
                        <Button className="w-full bg-black hover:bg-black/90 text-white rounded-full">
                            Upload album
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle>Upload latest released song</CardTitle>
                        <CardDescription>
                            Upload your newest track to feature it as your latest release.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-slate-100 p-3">
                            <Music className="h-6 w-6 text-slate-500" />
                        </div>
                        <p className="text-sm text-center text-muted-foreground">Upload your latest released song.</p>
                        <Button className="w-full bg-black hover:bg-black/90 text-white rounded-full">
                            Upload music
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle>Upload merch products</CardTitle>
                        <CardDescription>
                            Add new merch items to keep your store updated with the latest products and drops.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-slate-100 p-3">
                            <Music className="h-6 w-6 text-slate-500" />
                        </div>
                        <p className="text-sm text-center text-muted-foreground">Upload or create cards for latest products.</p>
                        <Button className="w-full bg-black hover:bg-black/90 text-white rounded-full">
                            Upload products
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <Tabs defaultValue="products" className="w-full">
                    <div className="px-6 py-4 flex items-center border-b">
                        <TabsList className="bg-transparent p-0 h-auto space-x-6">
                            <TabsTrigger
                                value="music"
                                className="bg-transparent p-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-medium"
                            >
                                Music albums list
                            </TabsTrigger>
                            <TabsTrigger
                                value="products"
                                className="bg-transparent p-0 pb-2 rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-medium"
                            >
                                Merchandise product list
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="products" className="p-0 m-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[300px]">Product name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-10 w-10 rounded-md object-cover bg-slate-100"
                                                />
                                                <span>{product.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{product.description}</TableCell>
                                        <TableCell>{product.price}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "font-normal",
                                                    product.stock === "In Stock" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"
                                                )}
                                            >
                                                {product.stock}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{product.size}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground">
                                                    Edit
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="music" className="p-6 text-center text-muted-foreground">
                        No music albums uploaded yet.
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
