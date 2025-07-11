import dbConnect from "@/lib/db";
import Income from "@/models/income";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const income = await Income.findById(id);
    if (!income) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Income not found" 
      }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      income 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const data = await req.json();
    
    // Convert date string to Date object
    if (data.date) {
      data.date = new Date(data.date);
    }

    const updatedIncome = await Income.findByIdAndUpdate(id, data, { new: true });
    if (!updatedIncome) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Income not found" 
      }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      income: updatedIncome 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const deletedIncome = await Income.findByIdAndDelete(id);
    if (!deletedIncome) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Income not found" 
      }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Income deleted successfully" 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
}